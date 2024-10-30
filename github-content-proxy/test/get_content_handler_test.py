from dotenv import load_dotenv
import os
import unittest
from unittest.mock import patch, Mock
from src.get_content_handler import lambda_handler
import base64
import jwt
import json

load_dotenv()
SECRET_KEY = os.environ.get('SECRET_KEY')

class LambdaHandlerTest(unittest.TestCase):
    
    @patch('src.get_content_handler.requests.get')
    def test_bad_request(self, mock_get):
        eventList = [
            {},
            {'pathParameters': {}}
        ]
        context = None
        
        for event in eventList:
            # when
            response = lambda_handler(event, context)
            
            # then
            self.assertEqual(response, {
                'statusCode': 400,
                'body': json.dumps('Bad Request')
            })
    
    @patch('src.get_content_handler.requests.get')
    def test_raw_token(self, mock_get):
        # given
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.headers = {
            'Content-Type': 'text/plain'
        }
        mock_response.content = base64.b64decode('TEST'.encode('utf-8'))
        mock_get.return_value = mock_response
        
        # when
        event = {
            'pathParameters': {
                'token' : 'ghp_TOKEN',
                'proxy' : 'USER/REPO/main/test/test.css'
            }
        }
        context = None
        response = lambda_handler(event, context)
        
        # then
        self.assertEqual(response, {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Methods': '*',
                'Content-Type': 'text/plain'
            },
            'body': 'TEST',
            'isBase64Encoded': True
        })
        mock_get.assert_called_once_with(
            'https://raw.githubusercontent.com/USER/REPO/main/test/test.css',
            headers = {
                'Authorization': 'token ghp_TOKEN'
            }
        )
        
    @patch('src.get_content_handler.requests.get')
    def test_jwt(self, mock_get):
        # given
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.headers = {
            'Content-Type': 'text/plain'
        }
        mock_response.content = base64.b64decode('TEST'.encode('utf-8'))
        mock_get.return_value = mock_response
        
        # when
        event = {
            'pathParameters': {
                'token' : jwt.encode({
                    'token': 'ghp_TOKEN',
                    'user': 'USER',
                    'repo': 'REPO'
                }, SECRET_KEY, algorithm='HS256'),
                'proxy' : 'USER/REPO/main/test/test.css'
            }
        }
        context = None
        response = lambda_handler(event, context)
        
        # then
        self.assertEqual(response, {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Methods': '*',
                'Content-Type': 'text/plain'
            },
            'body': 'TEST',
            'isBase64Encoded': True
        })
        mock_get.assert_called_once_with(
            'https://raw.githubusercontent.com/USER/REPO/main/test/test.css',
            headers = {
                'Authorization': 'token ghp_TOKEN'
            }
        )

if __name__ == '__main__':
    unittest.main()