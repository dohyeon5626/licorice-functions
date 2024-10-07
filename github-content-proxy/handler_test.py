import unittest
from unittest.mock import patch, Mock
from handler import lambda_handler
import base64

class LambdaHandlerTest(unittest.TestCase):
    
    @patch('handler.requests.get')
    def test_lambda_handler(self, mock_get):
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
                'token' : 'TOKEN',
                'proxy' : 'PATH'
            }
        }
        context = None
        response = lambda_handler(event, context)
        print(response)
        
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
            'https://raw.githubusercontent.com/PATH',
            headers = {
                'Authorization': 'token TOKEN'
            }
        )

if __name__ == '__main__':
    unittest.main()