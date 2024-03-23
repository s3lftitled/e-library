const { Course } = require('../models/e-book') 
const { isValidObjectId } = require('mongoose')

class CourseRepository {
  constructor() {
    if (!CourseRepository.instance) {
      this.instance = this
    }
    return this.instance
  }

  async findExistingCourseByTitle(title) {
    try { 
      return await Course.findOne({ title: { $regex: new RegExp(`^${title}$`, 'i') } })
    } catch(error) {
      throw new Error(`Error finding program by title: ${error.message}`)
    }
  }

  async createCourse() {
    try {
      const course = new Course({ title })
      return await course.save() 
    } catch (error) {
      throw new Error(`Error creating department ${error.message}`)
    }
  }

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

  async addLearningMaterialToCourse(courseID, learningMaterialID) {
    try {
      const course = await Course.findById(courseID)
      if (!course) {
        throw new Error('Course not found')
      }

      // Push the learning material ID to the course's learningMaterials array
      course.learningMaterials.push(learningMaterialID)

      // Save the updated course
      await course.save()

      return course
    } catch (error) {
      throw new Error(`Error adding learning material to course: ${error.message}`)
    }
  }

}

module.exports = CourseRepository