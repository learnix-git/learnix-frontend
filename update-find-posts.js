const fs = require('fs');
let code = fs.readFileSync('c:/Users/ASUS/Documents/learnix-frontend/app/find-posts/page.tsx', 'utf8');

// Replace imports
code = code.replace(/import \{ getPosts \} from "@\/lib\/api\/post";/g, 'import { getRequests } from "@/lib/api/request";');
code = code.replace(/PostListParams/g, 'RequestListParams');
code = code.replace(/import \{ TutorCard, TutorCardSkeleton \} from "@\/components\/tutor\/TutorCard";/g, 'import { RequestCard, RequestCardSkeleton } from "@/components/request/RequestCard";');
code = code.replace(/import type \{ Post \} from "@\/lib\/api\/types";/g, 'import type { RequestModel } from "@/lib/api/types";');

// FindTutorsPage -> FindPostsPage
code = code.replace(/FindTutorsPage/g, 'FindPostsPage');

// Posts -> Requests
code = code.replace(/setPosts/g, 'setRequests');
code = code.replace(/fetchPosts/g, 'fetchRequests');
code = code.replace(/getPosts/g, 'getRequests');
code = code.replace(/const \[posts,/g, 'const [requests,');
code = code.replace(/posts\.length/g, 'requests.length');
code = code.replace(/posts\.map/g, 'requests.map');
code = code.replace(/\(post\)/g, '(req)');
code = code.replace(/post\.id/g, 'req.id');
code = code.replace(/post=\{post\}/g, 'req={req}');

// Text replacements
code = code.replace(/Tìm gia sư/g, 'Tìm yêu cầu');
code = code.replace(/gia sư tại Learnix/g, 'yêu cầu tìm gia sư');
code = code.replace(/gia sư phù hợp/g, 'yêu cầu phù hợp');
code = code.replace(/tải danh sách gia sư/g, 'tải danh sách yêu cầu');
code = code.replace(/\/find-tutors/g, '/find-posts');

// Cards
code = code.replace(/<TutorCard /g, '<RequestCard ');
code = code.replace(/<TutorCardSkeleton/g, '<RequestCardSkeleton');

// Remove Rating filter logic
code = code.replace(/const \[minRating, setMinRating\] = useState<number>\(0\);\r?\n\s*const hasRatingFilter = minRating > 0;\r?\n/g, '');
code = code.replace(/hasRatingFilter \|\|/g, '');
code = code.replace(/if \(hasRatingFilter\) params\.minRating = minRating;\r?\n/g, '');
code = code.replace(/, minRating, hasRatingFilter/g, '');

code = code.replace(/hasRatingFilter && \{\r?\n\s*label: \`Từ \$\{minRating\} sao\`,\r?\n\s*onRemove: \(\) => \{ setMinRating\(0\); setCurrentPage\(1\); \},\r?\n\s*\},\r?\n/g, '');

// Also clear minRating in clearAllFilters
code = code.replace(/setMinRating\(0\);\r?\n/g, '');

// Remove the Rating section from FilterContent (between Đánh giá and end of FilterContent)
code = code.replace(/\/\* Đánh giá \*\/[\s\S]*?<\/div>[\r\n\s]*<\/div>[\r\n\s]*\);[\r\n\s]*return \(/g, '</div>\r\n    );\r\n\r\n    return (');

// Remove rating sorts
code = code.replace(/\{\s*label: "Đánh giá cao nhất", value: "rating-high"\s*\},\r?\n/g, '');
code = code.replace(/\{\s*label: "Đánh giá thấp nhất", value: "rating-low"\s*\},\r?\n/g, '');

fs.writeFileSync('c:/Users/ASUS/Documents/learnix-frontend/app/find-posts/page.tsx', code);
console.log('Done');
