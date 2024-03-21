const { LearningMaterial } = require('../models/e-book');

class LearningMaterialRepository {
  constructor() {
    if (!LearningMaterialRepository.instance) {
      LearningMaterialRepository.instance = this
    }
    return LearningMaterialRepository.instance
  }

  async createLearningMaterial(data) {
    try {
      return await LearningMaterial.create(data)
    } catch (error) {
      throw new Error(`Error creating learning material: ${error.message}`)
    }
  }

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

  async findLearningMaterial(learningMaterialsID) {
    try {
      await LearningMaterial.find({ _id: { $in: learningMaterialsID } })
    } catch (err0r) {
      throw new Error(`Error finding learning material: ${error.message}`)
    }
  }

}

module.exports = LearningMaterialRepository
