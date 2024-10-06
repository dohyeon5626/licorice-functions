import json
import requests
import base64

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
    headers = {
        'Authorization': f'token {token}'
    }

    response = requests.get(url, headers=headers)

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
