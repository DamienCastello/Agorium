const NSFW = require('nsfwjs');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const tf = require('@tensorflow/tfjs-node');
const { createCanvas, loadImage } = require('canvas');

async function scanForNSFW(imagePath) {
    const model = await NSFW.load();

    const image = await loadImage(imagePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    const input = tf.browser.fromPixels(canvas);
    const predictions = await model.classify(input);

    const nsfwContent = predictions.some(p => p.className === 'Porn' && p.probability > 0.7);
    if (nsfwContent) {
        throw new Error("Contenu vidéo suspect NSFW détecté.");
    }
}

async function extractFrameFromVideo(filePath, outputImagePath) {
    return new Promise((resolve, reject) => {
        ffmpeg(filePath)
            .screenshots({
                count: 1,
                folder: path.dirname(outputImagePath),
                filename: path.basename(outputImagePath)
            })
            .on('end', resolve)
            .on('error', reject);
    });
}

function analyzeVideo(filePath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) return reject(err);

            const videoStream = metadata.streams.find(s => s.codec_type === 'video');
            const audioStream = metadata.streams.find(s => s.codec_type === 'audio');

            if (!videoStream) return reject(new Error('Aucune piste vidéo trouvée'));

            // Extraction des informations vidéo et audio
            const { duration, size } = metadata.format;
            const { width, height, codec_name: codec, bit_rate: bitrate } = videoStream;

            if (!['h264', 'vp9', 'hevc'].includes(codec)) {
                return reject(new Error('Codec vidéo non supporté détecté.'));
            }

            const audioCodec = audioStream ? audioStream.codec_name : null;
            const audioDuration = audioStream ? audioStream.duration : 0;

            // Vérification des critères
            if (bitrate && bitrate > 5000000 && (width > 1920 || height > 1080)) {
                return reject(new Error('Bitrate trop élevé pour cette vidéo.'));
            }

            if (duration < 10 && size > 100 * 1024 * 1024) {
                return reject(new Error('Vidéo trop lourde pour une si courte durée.'));
            }

            if (!audioCodec || audioDuration === 0) {
                return reject(new Error('Aucun audio ou audio incohérent trouvé.'));
            }

            resolve({
                duration,
                size,
                width,
                height,
                codec,
                audioCodec,
                bitrate
            });
        });
    });
}

function isExecutableFile(filePath) {
    const extname = path.extname(filePath).toLowerCase();
    
    if (extname === '.mp4') {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(filePath, (err, metadata) => {
                if (err) {
                    console.error(`Erreur lors de l'analyse du fichier vidéo: ${err.message}`);
                    return reject(new Error(`Fichier vidéo corrompu ou non valide: ${filePath}`));
                }

                // Vérification que le fichier contient au moins un flux vidéo
                const videoStream = metadata.streams.find(s => s.codec_type === 'video');
                if (!videoStream) {
                    console.error(`Aucun flux vidéo trouvé dans le fichier: ${filePath}`);
                    return reject(new Error(`Aucun flux vidéo trouvé dans le fichier: ${filePath}`));
                }

                resolve(); // Le fichier est valide
            });
        });
    }
}

module.exports = { scanForNSFW, extractFrameFromVideo, analyzeVideo, isExecutableFile };