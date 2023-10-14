import BlogModel from "../models/blogmodel";
import UserModel from "../models/usermodel";
interface PaginationResults {
    next?: {
        page: number;
        limit: number;
    };
    previous?: {
        page: number;
        limit: number;
    };
    limit: number;
    current: number;
    count: number;
    endIndex: number;
    startIndex: number;
}

function Pagination() {
    return async (req: any, res: any, next: any) => {
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 5;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        let model: any = null;
        switch (req.query.model) {
            case 'blogmodel':
                model = BlogModel;
                break;
            case 'usermodel':
                model = UserModel;
                break;
            default:
                res.status(404).json({ status: false, message: "Not in proper syntax" });
                return;


        }

        if (model) {
            const modelCount = await model.find().countDocuments();
            const results: PaginationResults = {
                limit: 0,
                current: 0,
                count: 0,
                endIndex: 0,
                startIndex: 0,
            }; 

            // Next page
            if (endIndex < modelCount) {
                results.next = {
                    page: page + 1,
                    limit: limit
                };
            }

            // Previous page
            if (startIndex > 0) {
                results.previous = {
                    page: page - 1,
                    limit: limit
                };
            }

            // If both false
            if (endIndex > modelCount) {
                results.limit = modelCount;
            } else {
                results.limit = endIndex;
            }

            // Result
            results.current = parseInt(req.query.page);
            results.count = modelCount;
            results.endIndex = endIndex;
            results.startIndex = startIndex;

            req.Pagination = results;
            next();
        }
    };
}

export default Pagination;
