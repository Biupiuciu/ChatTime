export const Contact = ({
  username,
  userId,
  isSelected,
  isOnline,
  unread,
}: any) => {
  const colors = [
    "bg-lime-300 ",
    "bg-orange-400 ",
    "bg-emerald-300 ",
    "bg-rose-200 ",
    "bg-lime-200 ",
  ];
  const userIdBase10 = parseInt(userId.substring(10), 16);
  const colorIndex = userIdBase10 % colors.length;
  const color = isSelected ? "bg-rose-500" : colors[colorIndex];
  const selectedFontWeight = isSelected && "font-semibold";
  const isUnread = unread.has(userId);

  return (
    <div
      className={`sm:px-2 py-3 flex w-full items-center  text-md ${selectedFontWeight} `}
    >
      <div
        className={`hidden md:flex relative rounded-full aspect-ratio aspect-square h-12 ${color}  items-center justify-center mr-4 `}
      >
        <div
          className={`absolute rounded-full aspect-ratio aspect-square h-4 ${
            isOnline ? "bg-green-500" : "bg-zinc-200"
          } bottom-0 right-0  border-2 border-white`}
        ></div>
        {username[0]}
      </div>
      <h2 className="grow text-sm sm:text-lg">{username}</h2>
      {isUnread && (
        <div className=" rounded-full aspect-ratio aspect-square h-2 ml-1 sm:ml-2 md:h-3 bg-red-600 "></div>
      )}
    </div>
  );
};
