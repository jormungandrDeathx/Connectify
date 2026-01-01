import React from 'react'

function exp() {
  return (
    <div>
      {!chatLoading ? (
        Object.entries(groupedMessages).map(([date, messages]) => (
          <div key={date}>
            {/* Date Separator */}
            <div className="flex justify-center my-4">
              <span className="bg-gray-300/70 text-gray-700 text-xs px-3 py-1 rounded-lg shadow-sm">
                {formatDate(messages[0].createdAt)}
              </span>
            </div>

            {/* Messages for this date */}
            {messages.map((message) => {
              const isReceived = message.sender === chatBio?.username;
              return (
                <div
                  key={message.id}
                  className={`flex mb-2 ${
                    isReceived ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`flex flex-col ${isReceived ? "" : "items-end"}`}
                  >
                    <p
                      className={`py-2 px-3 mx-1 rounded-lg w-fit max-w-[75%]  ${
                        isReceived
                          ? "bg-white rounded-tl-none shadow"
                          : "bg-green-500 text-white rounded-tr-none"
                      }`}
                    >
                      {message.message}
                    </p>
                    <span className="text-[10px] text-gray-500 mx-2 mt-1">
                      {new Date(message.createdAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ))
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="w-15 h-15 border-b-2 rounded-full animate-spin border-pink-700"></div>
        </div>
      )}
    </div>
  )
}

export default exp
