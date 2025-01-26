from dotenv import load_dotenv
import os
import unittest
import json
import jwt
from src.get_token_handler import lambda_handler

load_dotenv()
SECRET_KEY = os.environ.get('SECRET_KEY')

class LambdaHandlerTest(unittest.TestCase):
    
    def test_jwt(self):
        # given
        user = 'USER'
        repo = 'REPO'
        githubToken = "GITHUB_TOKEN"
        
        # when
        event = {
            'body' : json.dumps({
                'user' : user,
                'repo' : repo,
                'token' : githubToken
            })
        }
        context = None
        response = lambda_handler(event, context)
        
        # then
        self.assertEqual(response['statusCode'], 201)
        self.assertEqual(response['headers'], {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Methods': '*',
                'Content-Type': 'application/json'
        })
        
        token = json.loads(response['body'])['token']
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        self.assertEqual(payload['user'], user)
        self.assertEqual(payload['repo'], repo)
        self.assertEqual(payload['token'], githubToken)

if __name__ == '__main__':
    unittest.main()