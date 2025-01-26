rm -rf dist/*
mkdir dist

pip3 install -r requirements.txt -t get_content_dist
cp src/get_content_handler.py get_content_dist/lambda_function.py
cp .env get_content_dist/.env
cd get_content_dist
zip -r ../dist/get_content.zip .
cd ..
rm -rf get_content_dist

pip3 install -r requirements.txt -t get_token_dist
cp src/get_token_handler.py get_token_dist/lambda_function.py
cp .env get_token_dist/.env
cd get_token_dist
zip -r ../dist/get_token.zip .
cd ..
rm -rf get_token_dist