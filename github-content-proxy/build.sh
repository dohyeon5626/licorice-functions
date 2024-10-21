pip3 install -r requirements.txt -t dist
cp handler.py dist/lambda_function.py
cp .env dist/.env
cd dist
zip -r ../dist.zip .
cd ..
rm -rf dist