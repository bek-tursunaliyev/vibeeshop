node test-vite-post.mjs > output.txt &
PID=$!
sleep 5
curl -i -X POST http://localhost:3004/api/auth/telegram > curl_output.txt
kill $PID
cat curl_output.txt
