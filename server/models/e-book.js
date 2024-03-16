const mongoose = require('mongoose');

const LearningMaterialSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    author: {
        type: String,
    },
    copyright: {
        type: String
    },
    license: {
        type: {
            type: String,
        },
        version: {
            type: String,
        },
        link: {
            type: String,
        },
    },    
    link: {
        type: String
    },
    file: {
        type: String,
    }
});

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
        type: String,
        required: true
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
    }]
})

const DepartmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    }, 
    programs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program'
    }]
})

const LearningMaterial = mongoose.model('LearningMaterial', LearningMaterialSchema)
const Course = mongoose.model('Course', CourseSchema)
const Program = mongoose.model('Program', ProgramSchema)
const Department = mongoose.model('Department', DepartmentSchema)

module.exports = {
    LearningMaterial,
    Course,
    Program,
    Department
}
