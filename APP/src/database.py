import sqlite3
from typing import List, Tuple

class VocabularyDatabase:
    def __init__(self, db_name: str = "vocabulary.db"):
        path = "data/" + db_name
        self.conn = sqlite3.connect(path)
        self.cursor = self.conn.cursor()
        self.create_table()

    def create_table(self):
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS vocabulaire (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                image TEXT NOT NULL,
                word TEXT NOT NULL,
                translation TEXT NOT NULL,
                theme TEXT NOT NULL
            )
        ''')
        self.conn.commit()

    def add_entry(self, image: str, word: str, translation: str, theme: str):
        if self.get_entry(word):
            self.update_entry(word, image, translation, theme)
            return
        
        self.cursor.execute('''
            INSERT INTO vocabulaire (image, word, translation, theme)
            VALUES (?, ?, ?, ?)
        ''', (image, word, translation, theme))
        self.conn.commit()

    def get_entry(self, word: str) -> Tuple[int, str, str, str, str]:
        self.cursor.execute('''
            SELECT * FROM vocabulaire WHERE word = ?
        ''', (word,))
        return self.cursor.fetchone()

    def get_all_entries(self) -> List[Tuple[int, str, str, str, str]]:
        self.cursor.execute('SELECT * FROM vocabulaire')
        return self.cursor.fetchall()

    def update_entry(self, word: str, image: str = None, translation: str = None, theme: str = None):
        query = 'UPDATE vocabulaire SET '
        params = []
        
        if image:
            query += 'image = ?, '
            params.append(image)
        if translation:
            query += 'translation = ?, '
            params.append(translation)
        if theme:
            query += 'theme = ?, '
            params.append(theme)
        
        query = query.rstrip(', ')
        query += ' WHERE word = ?'
        params.append(word)
        
        self.cursor.execute(query, tuple(params))
        self.conn.commit()

    def delete_entry(self, word: str):
        self.cursor.execute('DELETE FROM vocabulaire WHERE word = ?', (word,))
        self.conn.commit()

    def close(self):
        self.conn.close()

# Example usage
if __name__ == "__main__":
    db = VocabularyDatabase()

    # Adding entries
    db.add_entry("path/to/image1.png", "apple", "pomme", "fruit")
    db.add_entry("path/to/image2.png", "dog", "chien", "animal")

    # Fetching an entry
    print(db.get_entry("apple"))

    # Fetching all entries
    print(db.get_all_entries())

    # Updating an entry
    db.update_entry("apple", translation="pomme rouge")

    # Deleting an entry
    db.delete_entry("dog")

    db.close()