import os
import requests
from src.config import API_KEY

class ImageGenerator:
    def __init__(self):
        self.url = "https://api.limewire.com/api/image/generation"
        self.headers = {
            "Content-Type": "application/json",
            "X-Api-Version": "v1",
            "Accept": "application/json",
            "Authorization": "Bearer " + API_KEY
        }
    
    def get_image(self, word, aspect_ratio="1:1"):
        
        prompt = self.generate_prompt(word)

        payload = {
            "prompt": prompt,
            "aspect_ratio": aspect_ratio
        }
        
        response = requests.post(self.url, json=payload, headers=self.headers)
        
        if response.status_code == 200:
            data = response.json()
            return data
        else:
            print("Error: ", response.status_code)
            return None

    def generate_prompt(self, word):
        return f"A detailed illustration of {word}"
    
    def download_image(self, url, path):
        os.makedirs(os.path.dirname(path), exist_ok=True)

        response = requests.get(url)
        with open(path, "wb") as file:
            file.write(response.content)
    
    def fetch_image(self, word):
        data = self.get_image(word)

        if data is None:
            return {
                "word": word,
                "path": "error path"
            }
            

        print(data)
        
        image_url = data['data'][0]['asset_url']
        image_path = f"images/{word}.png"
        
        self.download_image(image_url, image_path)
        
        return {
            "word": word,
            "path": image_path
        }
    
    def fetch_image_test(self, word):
        
        image_url = "https://www.perlim.com/images/img-perlim/Pommes/pomme-golden-perlim-meylim-2.png"

        image_path = f"images/{word}.png"
        
        self.download_image(image_url, image_path)

        return {
            "word": word,
            "path": image_url
        }



# Example usage
if __name__ == "__main__":
    fetcher = ImageGenerator()

    word = "apple"
    
    image_data = fetcher.fetch_image_test(word)
    
    print(image_data)