const { Schema, model } = require('mongoose');
const stringCompare = require('../utils/stringCompare');
const s3Delete = require('../utils/aws/s3/s3Delete');
const cryto = require('crypto');

const BlogSchema = new Schema({

    title: {
        type: String,
        required: true
    },
    searchQuery: {
        type: String
    },
    content: {
        type: String,
        required: true
    },
    file: {
        fileType: {
            type: String,
            required: true
        },
        fileName: {
            type: String,
            required: true
        },
        fileUrl: {
            type: String,
            required: true
        }
    },
    isPremium: {
        type: Boolean,
        default: false
    }

})

BlogSchema.pre('save', function (next) {

    const hash = cryto.createHash('sha256').update(this.title).digest('hex');

    this.searchQuery = this.title.split(' ').join('-').toLowerCase()+hash;
    next();

})

BlogSchema.pre('findOneAndUpdate', async function (next) {

    const docToUpdate = await this.model.findOne(this.getQuery());

    // Update `searchQuery` if `title` is being modified
    if (this._update.title) {

        const hash = cryto.createHash('sha256').update(this._update.title).digest('hex');

        this._update.searchQuery = this._update.title.split(' ').join('-').toLowerCase()+hash;

    }

    // Check if `file` is empty or missing, and if so, assign previous `file`
    if (!this._update.file || Object.keys(this._update.file).length === 0) {
        this._update.file = docToUpdate.file;
    }

    // Check if `file` in the update is non-empty and different from `docToUpdate.file`
    const isFilePresentInUpdate = this._update.file && Object.keys(this._update.file).length !== 0;
    const isFileChanged = isFilePresentInUpdate && !stringCompare(docToUpdate.file.fileUrl, this._update.file.fileUrl);

    // Trigger file delete only if there's a new file different from the current one
    if (isFilePresentInUpdate && isFileChanged) {
        await s3Delete(docToUpdate.file.fileName);
    }

    next();
    
});

BlogSchema.pre('findOneAndDelete', async function (next) {

    const docToDelete = await this.model.findOne(this.getFilter());

    await s3Delete(docToDelete.file.fileName);

    next();

});


module.exports = model('blog', BlogSchema)