import { Star, MessageSquare, Filter, Flag, CheckCircle, Bell } from 'lucide-react';

const REVIEWS = [
  { id: 1, business: 'Raj Kitchen',      author: 'Amit S.',   rating: 5, comment: 'Excellent food and service! The QR code made it so easy to leave a review.', date: '2 mins ago',  status: 'Published' },
  { id: 2, business: 'FreshCafe Indore', author: 'Priya M.',  rating: 4, comment: 'Great coffee, but the queue was a bit long. Overall good experience.',          date: '15 mins ago', status: 'Published' },
  { id: 3, business: 'Meera Hair Salon', author: 'Rahul K.',  rating: 5, comment: 'Best haircut I have had in a long time. Very professional staff.',              date: '1 hour ago',  status: 'Published' },
  { id: 4, business: 'Sharma & Co.',     author: 'Suresh V.', rating: 3, comment: 'Decent service, but there is room for improvement in communication.',           date: '3 hours ago', status: 'Flagged'   },
];

const ReviewsPage = () => {
  return (
    <div className="flex-1 min-h-screen" style={{ backgroundColor: '#F4F7F4' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-30 backdrop-blur-xl border-b flex items-center justify-between px-6 sm:px-8 pt-5 pb-4"
        style={{ backgroundColor: 'rgba(255,255,255,0.85)', borderColor: '#D1E7DA' }}
      >
        <div>
          <h1 className="text-[22px] font-semibold text-gray-800">Reviews Feed</h1>
          <p className="text-gray-400 text-sm mt-0.5">Monitor and moderate user reviews across all businesses</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white border border-gray-200 rounded-lg p-1 flex shadow-sm">
            <button
              className="px-4 py-1.5 rounded-md text-xs font-semibold text-white"
              style={{ backgroundColor: '#1A6B45' }}
            >All</button>
            <button className="px-4 py-1.5 text-gray-400 text-xs font-medium hover:text-gray-700 transition-colors">Flagged</button>
          </div>
          <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: '#2ECC71' }} />
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      <div className="px-6 sm:px-8 py-6">
        <div className="max-w-4xl space-y-4">
          {REVIEWS.map((review) => (
            <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#E8F5EE', border: '1px solid #B6E2CB' }}
                  >
                    <MessageSquare className="w-4 h-4" style={{ color: '#1A6B45' }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{review.author}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Reviewed{' '}
                      <span className="font-semibold" style={{ color: '#1A6B45' }}>{review.business}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">{review.date}</p>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </div>
              </div>

              <p
                className="text-gray-600 text-sm leading-relaxed mb-5 p-4 rounded-xl border"
                style={{ backgroundColor: '#F4F7F4', borderColor: '#D1E7DA' }}
              >
                "{review.comment}"
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase border"
                    style={
                      review.status === 'Published'
                        ? { backgroundColor: '#E8F5EE', color: '#1A6B45', borderColor: '#B6E2CB' }
                        : { backgroundColor: '#FEF2F2', color: '#DC2626', borderColor: '#FECACA' }
                    }
                  >
                    {review.status}
                  </span>
                  {review.status === 'Published' && (
                    <CheckCircle className="w-3.5 h-3.5" style={{ color: '#2ECC71' }} />
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-red-500 transition-colors">Moderate</button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors">
                    <Flag className="w-3 h-3" />
                    Flag
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;
