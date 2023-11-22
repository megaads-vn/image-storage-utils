# Image Storage Utils

Utils for fetching, processing and storing image files

## Examples

```
const defaultOptions = {
    allowStorage: true,
    storagePath: 'storage/images',
    imageSizes: ['1200x0', '960x960', '96x96', '320x320', '180x180', '160x160', '250x250', '80x80', '400x600', '540x540', '255x255']
};
const imageStorageUtils = new (require('image-storage-utils'))(defaultOptions);

let imageBuffer = await imageStorageUtils.loadImage(url);

let fitImageSize = imageStorageUtils.fitImageSize("600x600");
```
