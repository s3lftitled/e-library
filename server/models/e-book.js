const mongoose = require('mongoose');

const LearningMaterialSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    fileUrl: {
        type: String,
        required: true
    },
})

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    learningMaterials: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LearningMaterial'
    }]
})

const ProgramSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    courses: [CourseSchema]
})

const LearningMaterial = mongoose.model('LearningMaterial', LearningMaterialSchema)
const Course = mongoose.model('Course', CourseSchema)
const Program = mongoose.model('Program', ProgramSchema)

module.exports = {
    LearningMaterial,
    Course,
    Program
}
