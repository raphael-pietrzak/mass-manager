

import json


def string_to_json(string):
    try:
        return json.loads(string)
    except Exception as e:
        print(e)
        return None
    
def parse_code_block(code_block):
    try:
        code = code_block.split("```json")[1].split("```")[0]
        return code
    except Exception as e:
        print(e)
        return None

def answer_to_list(answer):
    try:
        json =  string_to_json(parse_code_block(answer))
        return json
    except Exception as e:
        print(e)
        return None