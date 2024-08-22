# 📥 Kiwify Downloader

A tool to download all videos, files, and content from a Kiwify course with ease!

## 📄 Project Description

Kiwify Downloader is designed to automate the process of downloading course materials from Kiwify. By using the JSON data from a course's XHR request, this tool can organize and save videos, thumbnails, files, and other course content into a structured directory on your local machine.

## 🚀 How to Use

1. **Add the XHR JSON File:**
   - When you open a course on Kiwify, capture the JSON response from the XHR request.
   - Save the content in a `data.json` file.

2. **Set Up the `.env` File:**
   - If you notice that videos are being downloaded from a source other than the default, set the `BASE_URL` in your `.env` file.
   - Example:
     ```bash
     BASE_URL=https://your.custom.url
     ```

3. **Run the Script:**
   - Make sure to install dependencies with `npm install`.
   - Run the script with:
     ```bash
     node index.js
     ```

## 🛠️ Next Steps

- [ ] Download files from different sources (returning the download URL)
- [ ] Create a Chrome extension

## 📬 Feedback & Contributions

Feel free to open issues or contribute to the project by submitting pull requests!
