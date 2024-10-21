from dotenv import load_dotenv
import os
import json
import jwt
import requests
import base64

load_dotenv()
SECRET_KEY = os.environ.get('SECRET_KEY')

def lambda_handler(event, context):
    try:
        token = event['pathParameters']['token']
        path = event['pathParameters']['proxy']
    except KeyError as e:
        return {
            'statusCode': 400,
            'body': json.dumps(f"Missing parameter: {str(e)}")
        }

    url = f"https://raw.githubusercontent.com/{path}"
    
    if(token.startswith("ey")):
        token = jwt.decode(token, SECRET_KEY, algorithms="HS256")["token"]
    
    headers = {
        'Authorization': f'token {token}'
    }

    response = requests.get(url, headers = headers)

    return {
        'statusCode': response.status_code,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': '*',
            'Content-Type': response.headers['Content-Type']
        },
        'body': base64.b64encode(response.content).decode('utf-8'),
        'isBase64Encoded': True
    }
