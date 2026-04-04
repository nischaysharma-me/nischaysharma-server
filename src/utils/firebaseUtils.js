import { db } from '../config/firebase.js'

class FirebaseUtils {
    static async populate(document, paths, models) {
        if (!document) return null

        const pathArray = Array.isArray(paths) ? paths : [paths]

        for (const path of pathArray) {
            const config = typeof path === 'string'
                ? { path, idField: path + 'Id', model: path }
                : path

            const { path: fieldName, idField, model: modelName } = config
            const model = models[modelName]

            if (!model) {
                console.warn(`Model ${modelName} not found for population`)
                continue
            }

            if (document[idField] && typeof document[idField] === 'string') {
                document[fieldName] = await model.findById(document[idField])
            }

            if (Array.isArray(document[idField])) {
                document[fieldName] = await Promise.all(
                    document[idField].map(id => model.findById(id))
                )
            }
        }

        return document
    }

    static async isUnique(model, field, value, excludeId = null) {
        const query = { [field]: value }
        const existing = await model.find(query)

        if (existing.length === 0) return true
        if (excludeId && existing.length === 1 && existing[0].id === excludeId) {
            return true
        }

        return false
    }

    static transformFields(data, transformations) {
        const result = { ...data }

        for (const [field, transform] of Object.entries(transformations)) {
            if (result[field] && typeof result[field] === 'string') {
                switch (transform) {
                    case 'lowercase':
                        result[field] = result[field].toLowerCase()
                        break
                    case 'uppercase':
                        result[field] = result[field].toUpperCase()
                        break
                    case 'trim':
                        result[field] = result[field].trim()
                        break
                    case 'slug':
                        result[field] = result[field]
                            .toLowerCase()
                            .trim()
                            .replace(/[^\w\s-]/g, '')
                            .replace(/[\s_-]+/g, '-')
                            .replace(/^-+|-+$/g, '')
                        break
                }
            }
        }

        return result
    }

    static async batchWrite(operations) {
        const maxBatchSize = 500
        const batches = []

        for (let i = 0; i < operations.length; i += maxBatchSize) {
            const currentBatch = db.batch()
            const chunk = operations.slice(i, i + maxBatchSize)

            chunk.forEach(op => {
                const { type, collection, id, data } = op
                const ref = db.collection(collection).doc(id)

                switch (type) {
                    case 'create':
                    case 'set':
                        currentBatch.set(ref, data)
                        break
                    case 'update':
                        currentBatch.update(ref, data)
                        break
                    case 'delete':
                        currentBatch.delete(ref)
                        break
                }
            })

            batches.push(currentBatch.commit())
        }

        return await Promise.all(batches)
    }

    static async addToSubcollection(parentCollection, parentId, subCollection, data) {
        const ref = db
            .collection(parentCollection)
            .doc(parentId)
            .collection(subCollection)

        const docRef = await ref.add(data)
        return { id: docRef.id, ...data }
    }

    static async querySubcollection(parentCollection, parentId, subCollection, query = {}) {
        let ref = db
            .collection(parentCollection)
            .doc(parentId)
            .collection(subCollection)

        for (const [field, value] of Object.entries(query)) {
            ref = ref.where(field, '==', value)
        }

        const snapshot = await ref.get()
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    }

    static async paginate(model, query = {}, options = {}) {
        const { page = 1, limit = 10, orderBy = 'createdAt', order = 'desc' } = options
        const skip = (page - 1) * limit

        const results = await model.find(query, {
            sort: { [orderBy]: order === 'desc' ? -1 : 1 },
            limit: limit + 1,
            skip
        })

        const hasNextPage = results.length > limit
        const docs = hasNextPage ? results.slice(0, -1) : results

        const totalDocs = await model.countDocuments(query)
        const totalPages = Math.ceil(totalDocs / limit)

        return {
            docs,
            totalDocs,
            limit,
            page,
            totalPages,
            hasNextPage,
            hasPrevPage: page > 1
        }
    }

    static async aggregate(model, field, operation, query = {}) {
        const docs = await model.find(query)

        switch (operation) {
            case 'count':
                return docs.length
            case 'sum':
                return docs.reduce((sum, doc) => sum + (doc[field] || 0), 0)
            case 'avg':
                const total = docs.reduce((sum, doc) => sum + (doc[field] || 0), 0)
                return docs.length > 0 ? total / docs.length : 0
            case 'min':
                return Math.min(...docs.map(doc => doc[field] || Infinity))
            case 'max':
                return Math.max(...docs.map(doc => doc[field] || -Infinity))
            default:
                throw new Error(`Unsupported operation: ${operation}`)
        }
    }

    static async search(model, field, searchTerm) {
        const allDocs = await model.find({})
        const lowerSearchTerm = searchTerm.toLowerCase()

        return allDocs.filter(doc => {
            const fieldValue = doc[field]
            if (typeof fieldValue === 'string') {
                return fieldValue.toLowerCase().includes(lowerSearchTerm)
            }
            return false
        })
    }

    static async softDelete(model, id) {
        return await model.findByIdAndUpdate(
            id,
            {
                isDeleted: true,
                deletedAt: new Date()
            },
            { new: true }
        )
    }

    static async restore(model, id) {
        return await model.findByIdAndUpdate(
            id,
            {
                isDeleted: false,
                deletedAt: null
            },
            { new: true }
        )
    }
}

export default FirebaseUtils

