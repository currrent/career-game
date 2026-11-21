import os


def dump_project():
    # Настройки
    output_filename = "project_dump.txt"
    exclude_dirs = {'.git', '.idea', '__pycache__', 'venv', '.venv', 'node_modules'}
    exclude_files = {'.DS_Store', 'project_dump.txt', 'dump_project.py'}

    # Расширения бинарных файлов (их содержимое не выводим)
    binary_exts = {'.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.zip', '.exe', '.db', '.woff', '.woff2', '.ttf'}

    print("Начинаю сборку файлов...")

    with open(output_filename, 'w', encoding='utf-8') as out:
        for root, dirs, files in os.walk('.'):
            # Исключаем ненужные папки из обхода
            dirs[:] = [d for d in dirs if d not in exclude_dirs]

            for file in files:
                if file in exclude_files:
                    continue

                file_path = os.path.join(root, file)

                # Делаем путь относительным и заменяем обратные слеши на прямые
                rel_path = os.path.relpath(file_path, '.').replace('\\', '/')

                out.write(f"=== {rel_path} ===\n")

                # Если файл бинарный, просто пишем заглушку
                if os.path.splitext(file)[1].lower() in binary_exts:
                    out.write("[Бинарный файл, содержимое скрыто]\n\n")
                    continue

                # Читаем и пишем текст
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        out.write(f.read())
                except UnicodeDecodeError:
                    out.write("[Ошибка кодировки: файл не в UTF-8]\n")
                except Exception as e:
                    out.write(f"[Ошибка чтения: {e}]\n")

                out.write("\n\n")  # Отступ между файлами

    print(f"✅ Готово! Все файлы собраны в: {output_filename}")


if __name__ == "__main__":
    dump_project()