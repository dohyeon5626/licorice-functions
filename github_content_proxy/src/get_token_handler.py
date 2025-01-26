from dotenv import load_dotenv
import os
import json
import jwt
import time

load_dotenv()
SECRET_KEY = os.environ.get('SECRET_KEY')

BadRequestResponse = {
    'statusCode': 400,
    'body': json.dumps('Bad Request')
}

def lambda_handler(event, context):
    body = json.loads(event.get('body'))
    
    if event and 'user' in body and 'repo' in body and 'token' in body:
        user = body['user']
        repo = body['repo']
        githubToken = body['token']
    else:
        return BadRequestResponse
    
    token = jwt.encode(
        payload = {
            'user' : user,
            'repo' : repo,
            'token' : githubToken,
            'exp' : time.time() + 3600
        },
        key = SECRET_KEY,
        algorithm = 'HS256'
    )

    return {
        'statusCode': 201,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': '*',
            'Content-Type': 'application/json'
        },
        'body': json.dumps({
            'token' : token
        })
    }
