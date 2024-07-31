
from src.settings import MODEL_LLM
import ollama

class Llm:

    def __init__(self):
        pass
    
    def generate_prompt(self, theme):
        prompt = f"""Génère moi sous format json une liste de 10 mots de vocabulaire associés à '{theme}', par
         exemple pour fruits : 
          ```json
            [
                "pomme",
                "banane",
                "orange",
                "raisin",
                "kiwi",
                "ananas",
                "cerise",
                "melon",
                "poire",
                "mangue"
            ]
            ```"""
        return prompt


    def ask(self, query):
        prompt = self.generate_prompt(query)
        messages = [
            {
                'role': 'user',
                'content': prompt,
            },
        ]
        response = ollama.chat(model=MODEL_LLM, messages=messages)
        return response['message']['content']

