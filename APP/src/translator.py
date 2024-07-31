from googletrans import Translator

class TranslatorBase:
    def __init__(self):
        self.translator = Translator()

    def translate(self, word, source_language="fr", target_language="en"):
        translation = self.translator.translate(word, src=source_language, dest=target_language)
        return translation.text
    

