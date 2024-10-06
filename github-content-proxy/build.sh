pip3 install -r requirements.txt -t dist
cp handler.py dist/lambda_function.py
cd dist
zip -r ../dist.zip .
cd ..
rm -rf dist