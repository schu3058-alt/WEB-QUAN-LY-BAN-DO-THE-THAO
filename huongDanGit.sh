#!/usr/bin/env bash
# Quy uoc nhanh va commit cho du an SportShop
#
# Dat ten nhanh:
#   feature/<ten-chuc-nang>   vi du feature/gio-hang
#   fix/<mo-ta-loi>           vi du fix/tinh-sai-tong-tien
#   chore/<viec-vat>          vi du chore/cap-nhat-tai-lieu
#
# Commit message (tieng Viet khong dau, dong dau <= 72 ky tu):
#   feat: them chuc nang dang ky tai khoan
#   fix: sua loi tinh tong tien gio hang
#   docs: cap nhat huong dan cai dat
#   test: them kiem thu cho module don hang
#
# Quy trinh:
#   1. git checkout -b feature/ten-chuc-nang
#   2. git add . && git commit -m "feat: mo ta ngan gon"
#   3. git push origin feature/ten-chuc-nang
#   4. Tao Pull Request, gan reviewer, lien ket issue Jira/GitHub tuong ung
echo "Xem noi dung script de biet quy uoc nhanh va commit."
