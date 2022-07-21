class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    search() {
        const keyword = this.queryString.keyword ? {
            $or: [
                {
                    name: {
                        $regex: this.queryString.keyword,
                        $options: 'i'
                    },
                },

                {
                    brand: {
                        $regex: this.queryString.keyword,
                        $options: 'i'
                    }
                }
            ]
        } : {}

        this.query = this.query.find({ ...keyword })
        return this;
    }

    filter() {
        const queryCopy = { ...this.queryString }

        // removing fields from the query
        const removeFiends = ['keyword', 'limit', 'page']
        removeFiends.forEach(el => delete queryCopy[el])

        // advance filter for price, ratings etc
        let queryString = JSON.stringify(queryCopy)
        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)

        this.query = this.query.find(JSON.parse(queryString))
        return this;
    }

    pagination(resultsPerPage) {
        const currentPage = Number(this.queryString.page) || 1;
        const skip = (currentPage - 1) * resultsPerPage;

        this.query = this.query.limit(resultsPerPage).skip(skip);

        return this;
    }

}

export default APIFeatures;