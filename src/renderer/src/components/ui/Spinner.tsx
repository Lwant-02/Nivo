export const Spinner = ({ size = 'size-12' }: { size?: string }) => {
  return (
    <div className="flex justify-center items-center w-full h-full">
      <svg
        className={`${size} text-purple`}
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="4" cy="12" r="1.5">
          <animate
            attributeName="r"
            dur="0.75s"
            values="1.5;3;1.5"
            repeatCount="indefinite"
          ></animate>
        </circle>
        <circle cx="12" cy="12" r="3">
          <animate
            attributeName="r"
            dur="0.75s"
            values="3;1.5;3"
            repeatCount="indefinite"
          ></animate>
        </circle>
        <circle cx="20" cy="12" r="1.5">
          <animate
            attributeName="r"
            dur="0.75s"
            values="1.5;3;1.5"
            repeatCount="indefinite"
          ></animate>
        </circle>
      </svg>
    </div>
  )
}
