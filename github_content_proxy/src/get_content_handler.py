from dotenv import load_dotenv
import os
import json
import jwt
import requests
import base64

load_dotenv()
SECRET_KEY = os.environ.get('SECRET_KEY')

BadRequestResponse = {
    'statusCode': 400,
    'body': json.dumps('Bad Request')
}

InvalidTokenResponse = {
    'statusCode': 401,
    'body': json.dumps('Invalid token')
}

def lambda_handler(event, context):
    pathParameters = event.get('pathParameters')
    
    if pathParameters and 'token' in pathParameters and 'proxy' in pathParameters:
        token = pathParameters['token']
        path = pathParameters['proxy']
        pathList = path.split('/')
        if (len(pathList) >= 2):
            user = pathList[0]
            repo = pathList[1]
        else:
            return BadRequestResponse
    else:
        return BadRequestResponse

    
    if(token.startswith('ey')):
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            if 'token' in payload and \
                'user' in payload and 'repo' in payload and \
                payload['user'] == user and payload['repo'] == repo:
                    token = payload['token']
            else:
                return InvalidTokenResponse
        except jwt.ExpiredSignatureError | jwt.InvalidTokenError:
            return InvalidTokenResponse
            

    response = requests.get(
        f'https://raw.githubusercontent.com/{path}',
        headers = {
            'Authorization': f'token {token}'
        }
    )

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
