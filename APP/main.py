
from src.settings import LANGUAGE
from src.llm import Llm
from src.utils import answer_to_list
from src.database import VocabularyDatabase
from src.image import ImageGenerator
from src.translator import TranslatorBase


class Main:
    def __init__(self):
        self.llm = Llm()
        self.db = VocabularyDatabase()
        self.image_generator = ImageGenerator()
        self.translator = TranslatorBase()

    def show_database(self):
        entries = self.db.get_all_entries()
        for entry in entries:
            print(entry)

    def run(self):
        print("Hello, welcome to the Vocabulary Image Generator!")
        theme = input("Theme: ")
        response = self.llm.ask(theme)
        print("LLM response: ", response)
        words = answer_to_list(response) 
        print("LLM: ", words)

        for word in words:
            print(f"Generating image for {word}")
            translation = self.translator.translate(word, source_language="fr", target_language=LANGUAGE)
            image_data = self.image_generator.fetch_image(word)
            path = image_data["path"]
            self.db.add_entry(path, word, translation, theme)
        
        self.show_database()
    


if __name__ == '__main__':
    main = Main()
    main.run()