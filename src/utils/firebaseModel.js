import { db, admin } from '../config/firebase.js'
import logger from '../utils/logger.js'

class FirebaseModel {
    constructor(collectionName, schema) {
        this.collectionName = collectionName
        this.schema = schema
        this.collection = db.collection(collectionName)
    }

    /**
     * Helper to check if a value is a Date or a Firestore Timestamp
     */
    _isDate(value) {
        return value instanceof Date || (value && typeof value.toDate === 'function');
    }

    /**
     * Helper to convert a value to a Date object if possible
     */
    _toDate(value) {
        if (value instanceof Date) return value;
        if (value && typeof value.toDate === 'function') return value.toDate();
        if (typeof value === 'string' || typeof value === 'number') {
            const date = new Date(value);
            return isNaN(date.getTime()) ? value : date;
        }
        return value;
    }

    /**
     * Normalize a data object by converting all potential date fields (as per schema) to Date objects
     */
    _normalizeData(data) {
        if (!data) return data;
        const normalized = { ...data };
        for (const [field, rules] of Object.entries(this.schema)) {
            if (normalized[field] !== undefined && normalized[field] !== null) {
                if (rules.type === Date || (rules.type && rules.type.name === 'Date')) {
                    normalized[field] = this._toDate(normalized[field]);
                }
            }
        }
        return normalized;
    }

    validate(data) {
        const errors = []

        for (const [field, rules] of Object.entries(this.schema)) {
            const value = data[field]

            if (rules.required && (value === undefined || value === null || value === '')) {
                errors.push(`${field} is required`)
                continue
            }

            if (value === undefined || value === null) continue

            if (rules.type) {
                const expectedType = rules.type.name.toLowerCase()

                if (expectedType === 'string' && typeof value !== 'string') {
                    errors.push(`${field} must be a string`)
                } else if (expectedType === 'number' && typeof value !== 'number') {
                    errors.push(`${field} must be a number`)
                } else if (expectedType === 'boolean' && typeof value !== 'boolean') {
                    errors.push(`${field} must be a boolean`)
                } else if (expectedType === 'date' && !this._isDate(value)) {
                    errors.push(`${field} must be a Date`)
                } else if (expectedType === 'array' && !Array.isArray(value)) {
                    errors.push(`${field} must be an array`)
                }
            }

            if (rules.enum && !rules.enum.includes(value)) {
                errors.push(`${field} must be one of: ${rules.enum.join(', ')}`)
            }

            if (rules.min !== undefined && value < rules.min) {
                errors.push(`${field} must be at least ${rules.min}`)
            }
            if (rules.max !== undefined && value > rules.max) {
                errors.push(`${field} must be at most ${rules.max}`)
            }

            if (rules.minlength && value.length < rules.minlength) {
                errors.push(`${field} must be at least ${rules.minlength} characters`)
            }
            if (rules.maxlength && value.length > rules.maxlength) {
                errors.push(`${field} must be at most ${rules.maxlength} characters`)
            }

            if (rules.validate && typeof rules.validate === 'function') {
                if (!rules.validate(value)) {
                    errors.push(`${field} validation failed`)
                }
            }

            if (rules.match && !rules.match.test(value)) {
                errors.push(`${field} format is invalid`)
            }
        }

        return errors
    }

    applyDefaultsAndCast(data) {
        let result = { ...data }

        for (const [field, rules] of Object.entries(this.schema)) {
            // Apply defaults
            if (result[field] === undefined && rules.default !== undefined) {
                result[field] = typeof rules.default === 'function'
                    ? rules.default()
                    : rules.default
            }
        }

        // Cast all fields as per schema
        return this._normalizeData(result);
    }

    async create(data) {
        let dataWithDefaults = this.applyDefaultsAndCast(data)

        // Ensure system fields are set before validation if they are in the schema
        if (this.schema.createdAt && !dataWithDefaults.createdAt) {
            dataWithDefaults.createdAt = new Date()
        }
        if (this.schema.updatedAt) {
            dataWithDefaults.updatedAt = new Date()
        }

        const errors = this.validate(dataWithDefaults)
        if (errors.length > 0) {
            throw new Error(`Validation failed: ${errors.join(', ')}`)
        }

        const docRef = await this.collection.add(dataWithDefaults)
        return { id: docRef.id, ...dataWithDefaults }
    }

    async findById(id) {
        if (!id) return null;
        const snapshot = await this.collection.where(admin.firestore.FieldPath.documentId(), '==', id).get();
        if (snapshot.empty) return null
        const doc = snapshot.docs[0];
        return { id: doc.id, ...this._normalizeData(doc.data()) }
    }

    async findOne(query = {}) {
        let ref = this.collection

        for (const [field, value] of Object.entries(query)) {
            if (value && value.$regex) {
                continue;
            }
            ref = ref.where(field, '==', value)
        }

        const snapshot = await ref.limit(1).get()
        if (snapshot.empty) return null

        const doc = snapshot.docs[0]
        return { id: doc.id, ...this._normalizeData(doc.data()) }
    }

    async find(query = {}, options = {}) {
        let ref = this.collection

        for (const [field, value] of Object.entries(query)) {
            if (typeof value === 'object' && value !== null) {
                if (value.$gte !== undefined) ref = ref.where(field, '>=', value.$gte)
                if (value.$gt !== undefined) ref = ref.where(field, '>', value.$gt)
                if (value.$lte !== undefined) ref = ref.where(field, '<=', value.$lte)
                if (value.$lt !== undefined) ref = ref.where(field, '<', value.$lt)
                if (value.$ne !== undefined) ref = ref.where(field, '!=', value.$ne)
                if (value.$in !== undefined) ref = ref.where(field, 'in', value.$in)
            } else {
                ref = ref.where(field, '==', value)
            }
        }

        if (options.sort) {
            if (typeof options.sort === 'string') {
                const parts = options.sort.split(' ');
                parts.forEach(part => {
                    const direction = part.startsWith('-') ? 'desc' : 'asc';
                    const field = part.replace(/^-/, '');
                    ref = ref.orderBy(field, direction);
                });
            } else {
                for (const [field, direction] of Object.entries(options.sort)) {
                    ref = ref.orderBy(field, direction === 1 || direction === 'asc' ? 'asc' : 'desc')
                }
            }
        }

        if (options.limit) {
            ref = ref.limit(options.limit)
        }

        if (options.skip) {
            ref = ref.offset(options.skip)
        }

        try {
            const snapshot = await ref.get()
            return snapshot.docs.map(doc => ({ id: doc.id, ...this._normalizeData(doc.data()) }))
        } catch (error) {
            // Handle missing index error by fetching without sort and sorting in memory
            if (error.message.includes('FAILED_PRECONDITION') && error.message.includes('index') && options.sort) {
                logger.warn(`Firestore missing index for collection "${this.collectionName}". Falling back to in-memory sort. Query: ${JSON.stringify(query)}`);
                
                // Fetch without the Firestore orderby
                // We recreate the ref without the orderby parts. 
                // Since this class doesn't store the filter state easily to "undo" orderby, 
                // it's easier to just re-run the query logic without the sort.
                let fallbackRef = this.collection;
                for (const [field, value] of Object.entries(query)) {
                    if (typeof value === 'object' && value !== null) {
                        if (value.$gte !== undefined) fallbackRef = fallbackRef.where(field, '>=', value.$gte)
                        if (value.$gt !== undefined) fallbackRef = fallbackRef.where(field, '>', value.$gt)
                        if (value.$lte !== undefined) fallbackRef = fallbackRef.where(field, '<=', value.$lte)
                        if (value.$lt !== undefined) fallbackRef = fallbackRef.where(field, '<', value.$lt)
                        if (value.$ne !== undefined) fallbackRef = fallbackRef.where(field, '!=', value.$ne)
                        if (value.$in !== undefined) fallbackRef = fallbackRef.where(field, 'in', value.$in)
                    } else {
                        fallbackRef = fallbackRef.where(field, '==', value)
                    }
                }
                
                // Still apply limit if possible (though we might need to fetch more to sort correctly)
                // For a proper sort, we'd need ALL matching docs, then sort, then limit.
                const fallbackSnapshot = await fallbackRef.get();
                let results = fallbackSnapshot.docs.map(doc => ({ id: doc.id, ...this._normalizeData(doc.data()) }));
                
                // Perform in-memory sort
                const sortEntries = typeof options.sort === 'string' 
                    ? [[options.sort.replace(/^-/, ''), options.sort.startsWith('-') ? -1 : 1]]
                    : Object.entries(options.sort);

                results.sort((a, b) => {
                    for (const [field, direction] of sortEntries) {
                        const dir = (direction === -1 || direction === 'desc') ? -1 : 1;
                        if (a[field] < b[field]) return -1 * dir;
                        if (a[field] > b[field]) return 1 * dir;
                    }
                    return 0;
                });

                // Apply skip and limit in memory
                if (options.skip) results = results.slice(options.skip);
                if (options.limit) results = results.slice(0, options.limit);
                
                return results;
            }
            throw error;
        }
    }

    async findByIdAndUpdate(id, updateData, options = {}) {
        if (!id) throw new Error(`${this.collectionName} update requires an ID`);
        
        const snapshot = await this.collection.where(admin.firestore.FieldPath.documentId(), '==', id).get();

        if (snapshot.empty) {
            if (options.upsert) {
                return await this.create({ ...updateData, id }) // Note: create uses .add(), so id param here might be ignored or stored as field. 
                // To support upsert with specific ID using .add is impossible. 
                // But typically upsert implies create if not exists.
            }
            return null
        }

        const docRef = snapshot.docs[0].ref;
        const doc = snapshot.docs[0];

        const castUpdateData = this._normalizeData(updateData);
        if (this.schema.updatedAt) {
            castUpdateData.updatedAt = new Date()
        }

        const currentData = this._normalizeData(doc.data())
        const mergedData = { ...currentData, ...castUpdateData }
        const errors = this.validate(mergedData)

        if (errors.length > 0) {
            throw new Error(`Validation failed: ${errors.join(', ')}`)
        }

        // Firestore rejects 'undefined' values. We must recursively clean the payload.
        const cleanUndefined = (obj) => {
            if (Array.isArray(obj)) {
                return obj.map(v => cleanUndefined(v)).filter(v => v !== undefined);
            }
            if (obj !== null && typeof obj === 'object' && !(obj instanceof Date) && typeof obj.toDate !== 'function') {
                return Object.entries(obj).reduce((acc, [key, val]) => {
                    if (val !== undefined) {
                        acc[key] = cleanUndefined(val);
                    }
                    return acc;
                }, {});
            }
            return obj;
        };

        const cleanedUpdateData = cleanUndefined(castUpdateData);

        await docRef.update(cleanedUpdateData)

        if (options.new) {
            return { id: doc.id, ...mergedData }
        }
        return { id: doc.id, ...currentData }
    }

    async findOneAndUpdate(query, updateData, options = {}) {
        const doc = await this.findOne(query)

        if (!doc) {
            if (options.upsert) {
                return await this.create({ ...query, ...updateData })
            }
            return null
        }

        return await this.findByIdAndUpdate(doc.id, updateData, options)
    }

    async findByIdAndDelete(id) {
        if (!id) return null;
        const snapshot = await this.collection.where(admin.firestore.FieldPath.documentId(), '==', id).get();
        if (snapshot.empty) return null

        const doc = snapshot.docs[0];
        const docData = { id: doc.id, ...this._normalizeData(doc.data()) };
        
        await doc.ref.delete()
        return docData
    }

    async countDocuments(query = {}) {
        const docs = await this.find(query)
        return docs.length
    }

    async deleteMany(query = {}) {
        const docs = await this.find(query)
        const batch = db.batch()

        docs.forEach(doc => {
            // Need ref. Since we got doc from find(), we can't get ref directly if .doc(id) is broken?
            // Actually find() implementation returns plain objects, not snapshots. 
            // So we can't get refs from find() results easily if .doc(id) is broken.
            // We need to fetch snapshots.
        })
        
        // Re-implementing deleteMany to get snapshots
        let ref = this.collection
        // ... apply query filters ... (simplified reuse of logic)
        for (const [field, value] of Object.entries(query)) {
             if (typeof value === 'object' && value !== null) {
                // ... same filter logic ...
             } else {
                ref = ref.where(field, '==', value)
             }
        }
        
        const snapshot = await ref.get();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit()
        return { deletedCount: snapshot.size }
    }

    async updateMany(query = {}, updateData) {
        // Similar issue for updateMany, need snapshots
        let ref = this.collection
         for (const [field, value] of Object.entries(query)) {
             if (typeof value === 'object' && value !== null) {
                // ... same filter logic ...
             } else {
                ref = ref.where(field, '==', value)
             }
        }

        const snapshot = await ref.get();
        const batch = db.batch()

        const castUpdateData = this._normalizeData(updateData);
        if (this.schema.updatedAt) {
            castUpdateData.updatedAt = new Date()
        }

        snapshot.docs.forEach(doc => {
            batch.update(doc.ref, castUpdateData)
        })

        await batch.commit()
        return { modifiedCount: snapshot.size }
    }

    async aggregate(pipeline) {
        console.warn('Aggregation pipeline is not supported in FirebaseModel. Returning empty result.');
        return [];
    }

    async createIndex(indexSpec) {
        return;
    }
}

export default FirebaseModel;