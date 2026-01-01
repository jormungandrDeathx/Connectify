import { IoMdStar } from "react-icons/io";

function ReviewCard({ review }) {
  return (
    <div
      className="flex max-w-sm w-full h-fit rounded-2xl shadow animate-infinite-scroll"
    >
      <div className="w-25 h-25 mx-2 pr-1 my-1 border-r border-gray-300 flex justify-center">
        <img
          src={review.productImage}
          alt={review.productName}
          className="object-contain"
        />
      </div>
      <div className="flex flex-col justify-center w-75 px-1">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <img
              src={review.profile_image}
              alt=""
              className="rounded-full w-10"
            />
            <span className="text-sm text-gray-800 font-medium">
              {review.name?.split("")[0]}
            </span>
          </div>
          <span
            className={`flex items-center mx-2 text-xs text-gray-800 rounded-full px-1 ${
              review.rating > 3 ? "bg-green-500" : "bg-amber-400"
            }`}
          >
            {review.rating}<IoMdStar/>
          </span>
        </div>
        <h1 className="line-clamp-2 text-xs xl:text-sm text-gray-700 py-2">
          {review.message}
        </h1>
      </div>
    </div>
  );
}

export default ReviewCard;
