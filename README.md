
# 📆 Persian Calendar Holidays Scraper

This repository contains an automated scraper that fetches Persian calendar holidays for multiple years and stores them in JSON format.

## 🚀 Features
- Automatically fetches **Persian (Solar Hijri) holidays** every year.
- Uses **Puppeteer** to scrape data from reliable sources.
- Stores holidays in a structured **JSON format**.
- **GitHub Actions** runs the scraper yearly and updates the repository.

## 📜 How It Works
1. **GitHub Actions** triggers the scraper at the start of each Persian year.
2. **Puppeteer** fetches holiday data and stores it in the `holidays/` directory.
3. **JSON files** are committed and pushed automatically.

## 📂 Folder Structure

📦 shamsi-holidays<br>
┣ 📂 holidays<br>
┃ ┣ 📜 1403.json<br>
┃ ┣ 📜 1404.json<br>
┃ ┣ 📜 1405.json<br>
┃ ┗ 📜 ...<br>
┣ 📜 index.js<br>
┣ 📜 .github/workflows/scraper.yml<br>
┗ 📜 README.md<br>
```

## 🛠 Setup & Usage

### **Run Locally**
1. Clone the repository:
   ```sh
   git clone https://github.com/hasan-ahani/shamsi-holidays.git
   cd shamsi-holidays
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Run the scraper for a specific year:
   ```sh
   node fetchHolidays.js 1403
   ```

### **Automated Workflow**
- The scraper runs **automatically** every year using **GitHub Actions**.
- You can also trigger it manually by running:
  ```sh
  gh workflow run scraper.yml
  ```

## 🌐 Access JSON Data (Raw URL)
You can directly access the JSON data for each year using GitHub's raw content link.  
For example, to get holidays for the year **1403**, use:

```
https://raw.githubusercontent.com/hasan-ahani/shamsi-holidays/main/holidays/1403.json
```

Simply replace `1403.json` with any other Persian year to get the holidays for that year.

### **Usage Example (Fetching JSON with JavaScript)**
```js
fetch("https://raw.githubusercontent.com/hasan-ahani/shamsi-holidays/main/holidays/1403.json")
  .then(response => response.json())
  .then(data => console.log(data));
```

## 🤝 Contributing
1. Fork the repository.
2. Create a new branch:
   ```sh
   git checkout -b feature-branch
   ```
3. Make your changes and commit:
   ```sh
   git commit -m "Add a new feature"
   ```
4. Push the branch:
   ```sh
   git push origin feature-branch
   ```
5. Open a **Pull Request**.

## 📜 License
This project is licensed under the **MIT License**. Feel free to use and modify.
```