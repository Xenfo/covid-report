import { IButtonProps } from '../typings';

const Button: React.FC<IButtonProps> = ({
  children,
  ...props
}: IButtonProps) => (
  <button
    className="focus:shadow-outline w-full rounded bg-gray-900 py-2 px-4 font-bold text-white hover:bg-gray-800 focus:outline-none disabled:bg-gray-800"
    {...props}
  >
    {children}
  </button>
);

export default Button;
