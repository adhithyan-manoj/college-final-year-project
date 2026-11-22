import json
import re
from typing import Dict, Any, List, Optional
import requests
from app.config import settings
from app.database import db
from app.models.chat import AIChatRequest, AIChatResponse, SourceCitation

class AIService:
    @staticmethod
    def answer_query(req: AIChatRequest) -> AIChatResponse:
        message = req.message.strip()
        lang = req.language or "en"
        context_scheme_id = req.context_scheme_id

        # 1. Retrieve Candidate Schemes from Database
        matched_schemes = []
        if context_scheme_id:
            scheme = db.get_scheme_by_id(context_scheme_id)
            if scheme:
                matched_schemes.append(scheme)
        
        # If no specific context, search schemes using keywords
        if not matched_schemes:
            all_schemes = db.get_schemes({"limit": "251"})
            # Keyword matching on scheme text
            tokens = [t.lower() for t in re.findall(r'\b\w+\b', message) if len(t) > 2]
            
            scored = []
            for s in all_schemes:
                text = f"{s.get('scheme_name', '')} {s.get('sector', '')} {s.get('state_or_ut', '')} {s.get('scheme_purpose', '')} {s.get('intended_beneficiaries', '')}".lower()
                matches = sum(1 for t in tokens if t in text)
                if matches > 0:
                    scored.append((matches, s))
            
            scored.sort(key=lambda x: x[0], reverse=True)
            matched_schemes = [s for _, s in scored[:4]]
            
            # If still none, fallback to top 3 schemes
            if not matched_schemes and all_schemes:
                matched_schemes = all_schemes[:3]

        # 2. Build Grounded Context & Citations
        citations: List[SourceCitation] = []
        context_parts = []
        missing_info = []

        for s in matched_schemes:
            sid = s.get('scheme_id', '')
            sname = s.get('scheme_name', '')
            s_url = s.get('source_url')
            app_url = s.get('official_application_url')
            auth = s.get('implementing_authority')

            citations.append(SourceCitation(
                scheme_id=sid,
                scheme_name=sname,
                source_url=s_url,
                official_application_url=app_url,
                authority=auth
            ))

            is_verified = bool(s.get('eligibility_rule_verification') and 'verified' in str(s.get('eligibility_rule_verification')).lower())
            
            if not is_verified:
                missing_info.append(f"{sname}: Detailed eligibility rules (income limits, age, certificates) are listed as unverified in official dataset.")

            context_parts.append(
                f"- Scheme ID: {sid}\n"
                f"  Name: {sname}\n"
                f"  Authority: {auth or 'Unspecified Department'}\n"
                f"  State/Scope: {s.get('state_or_ut', 'National')}\n"
                f"  Sector: {s.get('sector', 'General')}\n"
                f"  Purpose: {s.get('scheme_purpose') or s.get('benefit_summary') or 'Details in official source'}\n"
                f"  Verified Status: {'Verified' if is_verified else 'Unverified listing'}\n"
                f"  Application URL: {app_url or 'None listed'}\n"
                f"  Source URL: {s_url or 'None listed'}"
            )

        grounded_context = "\n\n".join(context_parts)

        # 3. Check if Gemini API is available
        if settings.GEMINI_API_KEY:
            try:
                system_instruction = (
                    "You are SchemeConnect AI, an official government scheme discovery advisor for Indian citizens. "
                    "Rules you must strictly follow:\n"
                    "1. Only ground your answers on the provided scheme records from the database.\n"
                    "2. Always cite the Scheme ID, Scheme Name, and Official Source URL.\n"
                    "3. If eligibility criteria (like income limits or exact age) are unverified or missing in the database, explicitly state: 'Detailed eligibility requirements need verification from official guidelines.'\n"
                    "4. Never hallucinate deadlines, fake benefit amounts, or claim that you submitted an application.\n"
                    f"5. Answer strictly in {'Malayalam (മലയാളം)' if lang == 'ml' else 'English'}."
                )

                prompt_payload = {
                    "contents": [{
                        "parts": [
                            {"text": f"{system_instruction}\n\nAvailable Database Records:\n{grounded_context}\n\nUser Question: {message}"}
                        ]
                    }],
                    "generationConfig": {
                        "temperature": 0.2,
                        "maxOutputTokens": 800
                    }
                }

                gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
                resp = requests.post(gemini_url, json=prompt_payload, timeout=8)
                if resp.status_code == 200:
                    data = resp.json()
                    candidate = data['candidates'][0]['content']['parts'][0]['text']
                    return AIChatResponse(
                        reply=candidate,
                        language=lang,
                        citations=citations,
                        missing_information=missing_info,
                        is_grounded=True
                    )
            except Exception:
                # Fallback to deterministic offline synthesis
                pass

        # 4. Deterministic Offline Rule-Grounded Synthesis
        # Formulate grounded response based on user language
        if lang == "ml":
            # Malayalam response
            intro = "ഞങ്ങളുടെ ഔദ്യോഗിക ഡാറ്റാബേസിൽ നിന്നുള്ള വിവരങ്ങൾ താഴെ നൽകുന്നു:\n\n"
            bullets = []
            for s in matched_schemes:
                name = s.get('scheme_name')
                auth = s.get('implementing_authority') or "സർക്കാർ വകുപ്പ്"
                state = s.get('state_or_ut')
                url = s.get('official_application_url') or s.get('source_url') or "ഔദ്യോഗിക പോർട്ടൽ പരിശോധിക്കുക"
                
                bullets.append(
                    f"📌 **{name}**\n"
                    f"- നടപ്പിലാക്കുന്ന വകുപ്പ്: {auth}\n"
                    f"- പരിധി: {state}\n"
                    f"- ഔദ്യോഗിക ലിങ്ക്: {url}\n"
                    f"- ശ്രദ്ധിക്കുക: ഈ പദ്ധതിയുടെ സമ്പൂർണ്ണ യോഗ്യതാ മാനദണ്ഡങ്ങൾ ഔദ്യോഗിക പോർട്ടലിൽ നേരിട്ട് സ്ഥിരീകരിക്കേണ്ടതുണ്ട്."
                )
            outro = "\n\nകൂടുതൽ വിവരങ്ങൾക്കും അപേക്ഷ സമർപ്പിക്കുന്നതിനും മുകളിൽ നൽകിയിട്ടുള്ള ഔദ്യോഗിക സർക്കാർ ലിങ്കുകൾ സന്ദർശിക്കുക."
            reply_text = intro + "\n\n".join(bullets) + outro
        else:
            # English response
            intro = "Based on verified database records from our official government schemes catalog:\n\n"
            bullets = []
            for s in matched_schemes:
                name = s.get('scheme_name')
                auth = s.get('implementing_authority') or "Responsible Government Ministry"
                state = s.get('state_or_ut') or "All India"
                url = s.get('official_application_url') or s.get('source_url') or "Official portal"
                
                bullets.append(
                    f"### {name} (`{s.get('scheme_id')}`)\n"
                    f"- **Authority:** {auth}\n"
                    f"- **Applicable Scope:** {state}\n"
                    f"- **Sector / Category:** {s.get('sector', 'Welfare & Assistance')}\n"
                    f"- **Official Link:** [{url}]({url})\n"
                    f"- **Verification Note:** Detailed eligibility criteria (income, age cutoff, category certificate) must be confirmed via official guidelines."
                )
            outro = "\n\n*Note: SchemeConnect only references official government records. Please visit the official portal before applying.*"
            reply_text = intro + "\n\n".join(bullets) + outro

        return AIChatResponse(
            reply=reply_text,
            language=lang,
            citations=citations,
            missing_information=missing_info,
            is_grounded=True
        )
