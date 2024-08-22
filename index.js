const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { parse } = require('json5');

const BASE_URL = process.env.BASE_URL;
const escapeFs = (name) => name.replace(/[/\\?%*:|"<>]/g, '-');

const runCommand = (cmd) => {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                process.stderr.write(stderr);
                reject(false);
            } else {
                process.stdout.write(stdout);
                resolve(true);
            }
        });
    });
};

const downloadStream = async (url, dest) => {
    if (fs.existsSync(dest)) {
        console.log('> Skipping, file exists.');
        return false;
    }

    const destParts = path.parse(dest);
    const tmpDest = `${destParts.dir}/${destParts.name}_tmp${destParts.ext}`;
    const cmd = `ffmpeg -protocol_whitelist file,http,https,tcp,tls -allowed_extensions ALL -i "${url}" -bsf:a aac_adtstoasc -c copy "${tmpDest}" && mv "${tmpDest}" "${dest}"`;

    return runCommand(cmd);
};

const downloadFile = async (url, dest) => {
    if (fs.existsSync(dest)) {
        console.log('> Skipping, file exists.');
        return false;
    }

    const cmd = `wget "${url}" -O "${dest}_tmp" && mv "${dest}_tmp" "${dest}"`;

    return runCommand(cmd);
};

const processLesson = async (lesson, lessonPath) => {
    if (!fs.existsSync(lessonPath)) {
        fs.mkdirSync(lessonPath, { recursive: true });
    }

    fs.writeFileSync(path.join(lessonPath, 'lesson.json'), JSON.stringify(lesson, null, 2));

    if (lesson.video) {
        console.log(`> Starting download of '${lesson.title}' video and thumbnail`);
        await downloadStream(lesson.video.stream_link, path.join(lessonPath, lesson.video.name));
        const thumb = lesson.video.thumbnail;
        if (thumb.length > 0) {
            const thumbnailUrl = thumb.startsWith('http') ? thumb : BASE_URL + thumb;
            await downloadFile(thumbnailUrl, path.join(lessonPath, 'thumbnail.png'));
        }
    }

    if (lesson.files) {
        console.log(`> Starting download of '${lesson.title}' files`);
        for (const file of lesson.files) {
            const fileUrl = file.url.startsWith('http') ? file.url : BASE_URL + file.url;
            await downloadFile(fileUrl, path.join(lessonPath, file.name)).catch(error => console.log(`> Error on download ${file.name}`))
        }
    }

    if (lesson.content) {
        fs.writeFileSync(path.join(lessonPath, 'content.md'), lesson.content);
    }
};

const downModule = async (modules, output) => {
    for (let m = 0; m < modules.length; m++) {
        const module = modules[m];
        const moduleName = escapeFs(`${m}_` + module.name);
        const modulePath = path.join(output, moduleName);

        if (!fs.existsSync(modulePath)) {
            fs.mkdirSync(modulePath, { recursive: true });
        }

        fs.writeFileSync(path.join(modulePath, 'module.json'), JSON.stringify(module, null, 2));
        console.log(`\nModule '${moduleName}'`);

        for (let l = 0; l < module.lessons.length; l++) {
            const lesson = module.lessons[l];
            const lessonName = escapeFs(`${l}_` + lesson.title);
            const lessonPath = path.join(modulePath, lessonName);

            await processLesson(lesson, lessonPath);
        }
    }
};

const kiwifyDownload = async () => {
    const output = 'downloads'
    const json = fs.readFileSync('data.json', 'utf8');
    const node = parse(json);

    if (!fs.existsSync(output)) {
        fs.mkdirSync(output, { recursive: true });
    }

    fs.writeFileSync(path.join(output, 'course.json'), json);

    const course = node.course;

    if (course.sections) {
        for (const section of course.sections) {
            await downModule(section.modules, output);
        }
    } else {
        await downModule(course.modules, output);
    }
};

// Entry point if run as a standalone script
(async () => {
    await kiwifyDownload();
})();
