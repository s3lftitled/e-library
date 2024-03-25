const { LearningMaterial } = require('../models/e-book');

class LearningMaterialRepository {
  constructor() {
    // Singleton pattern implementation
    if (!LearningMaterialRepository.instance) {
      LearningMaterialRepository.instance = this
    }
    return LearningMaterialRepository.instance
  }

  // Method to create new learning material
  async createLearningMaterial(data) {
    try {
      return await LearningMaterial.create(data)
    } catch (error) {
      throw new Error(`Error creating learning material: ${error.message}`)
    }
  }

  // Method to find and validate material
  async findAndValidateMaterial(materialID) {
    try {
      const material = await LearningMaterial.findById(materialID)
      if (!material) {
        throw new Error('Material not found')
      }
      return material
    } catch (error) {
      throw new Error(`Error finding and validating material: ${error.message}`)
    }
  }

  // Method to find learning material
  async findLearningMaterial(learningMaterialsID) {
    try {
      return await LearningMaterial.find({ _id: { $in: learningMaterialsID } })
    } catch (error) {
      throw new Error(`Error finding learning material: ${error.message}`)
    }
  }
}

module.exports = LearningMaterialRepository
