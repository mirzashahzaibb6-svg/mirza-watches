#!/usr/bin/env bash
# Run with the API up: bash test/smoke.sh   (API=http://localhost:4000)
API=${API:-http://localhost:4000}; J=/tmp/mz.jar; rm -f $J; ok(){ echo "PASS $1"; }; bad(){ echo "FAIL $1"; exit 1; }
code(){ curl -s -o /dev/null -w "%{http_code}" "$@"; }
[ "$(code $API/products)" = 200 ] && ok "guest browses products" || bad products
[ "$(code -X POST $API/orders -H 'Content-Type: application/json' -d '{}')" = 401 ] && ok "guest cannot order (401)" || bad guest-order
[ "$(code $API/admin/stats)" = 401 ] && ok "guest cannot reach admin" || bad admin-guest
E=u$RANDOM@test.dev
curl -s -c $J -X POST $API/auth/register -H 'Content-Type: application/json' -d "{\"name\":\"Test User\",\"email\":\"$E\",\"phone\":\"+923001234567\",\"password\":\"Passw0rd1\"}" | grep -q "$E" && ok register || bad register
[ "$(code -b $J $API/admin/stats)" = 403 ] && ok "customer blocked from admin (403)" || bad admin-customer
PID=$(curl -s "$API/products?limit=1" | sed -E 's/.*"items":\[\{"id":"([^"]+)".*/\1/')
curl -s -b $J -X POST $API/orders -H 'Content-Type: application/json' -d "{\"items\":[{\"productId\":\"$PID\",\"quantity\":1}],\"address\":{\"city\":\"Karachi\"},\"delivery\":\"standard\",\"method\":\"COD\",\"coupon\":\"WELCOME10\"}" | grep -q '"status":"PENDING"' && ok "order + coupon" || bad order
[ "$(code -b $J -X POST $API/wishlist/$PID)" = 201 ] && ok wishlist || bad wishlist
echo "All smoke tests passed"
