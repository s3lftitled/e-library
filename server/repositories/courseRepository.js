const { Course } = require('../models/e-book') 
const { isValidObjectId } = require('mongoose')

class CourseRepository {
  constructor() {
    // Singleton pattern implementation
    if (!CourseRepository.instance) {
      CourseRepository.instance = this
    }
    return this.instance
  }

  // Method to find an existing course by title
  async findExistingCourseByTitle(title) {
    try { 
      return await Course.findOne({ title: { $regex: new RegExp(`^${title}$`, 'i') } })
    } catch(error) {
      throw new Error(`Error finding program by title: ${error.message}`)
    }
  }

  // Method to create a new course
  async createCourse(title) {
    try {
      const course = new Course({ title })
      return await course.save() 
    } catch (error) {
      throw new Error(`Error creating course ${error.message}`)
    }
  }

  // Method to find and validate a course by ID
  async findAndValidateCourse(courseId) {
    try {
      if (!isValidObjectId(courseId)) {
        throw new Error('Invalid course ID')
      }
      const course = await Course.findOne({ _id: courseId })
      if (!course) {
        throw new Error('Course not found')
      }
      return course
    } catch (error) {
      throw new Error(`Error finding and validating course: ${error.message}`)
    }
  }

  // Method to add a learning material to a course
  async addLearningMaterialToCourse(courseID, learningMaterialID) {
    try {
      const course = await Course.findById(courseID)
      if (!course) {
        throw new Error('Course not found')
      }

      course.learningMaterials.push(learningMaterialID)

      await course.save()

      return course
    } catch (error) {
      throw new Error(`Error adding learning material to course: ${error.message}`)
    }
  }

}

module.exports = CourseRepository