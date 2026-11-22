// Ngăn cửa sổ command prompt phụ hiển thị trên Windows trong bản build phát hành
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tochucnhanvienai_desktop_lib::run();
}
