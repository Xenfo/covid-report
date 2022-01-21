import { Dialog, Transition } from '@headlessui/react';
import { ClipboardCheckIcon, ClipboardIcon } from '@heroicons/react/outline';
import { Fragment, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { SpinnerCircular } from 'spinners-react';

interface CaseIDDialogProps {
  isSubmitting: boolean;
  caseId: string;
  setCaseId: (caseId: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const CaseIDDialog: React.FC<CaseIDDialogProps> = ({
  isSubmitting,
  caseId,
  setCaseId,
  isOpen,
  setIsOpen
}: CaseIDDialogProps) => {
  const [isCopying, setIsCopying] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsCopying(false), 2000);
  }, [isCopying]);

  const close = () => {
    setCaseId('');
    setIsOpen(false);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={() => close()}
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0" />
          </Transition.Child>

          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900 text-center"
              >
                Case ID
              </Dialog.Title>

              {isSubmitting || caseId.length === 0 ? (
                <div className="mt-4 flex justify-center">
                  <SpinnerCircular
                    className="inline-block"
                    thickness={180}
                    color="#2563EB"
                    secondaryColor="rgba(0, 0, 0, 0.44)"
                  />
                </div>
              ) : (
                <>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Save this case ID to your device so you can access it
                      later.
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <div className="mt-4 p-2 px-3 mx-12 inline-flex justify-center items-center flex-row rounded-md bg-gray-200">
                      <p className="mr-2 text-md font-medium">{caseId}</p>
                      <button
                        className="p-[2px] rounded-md shadow-md border-2 border-opacity-70 border-gray-900"
                        onClick={async () => {
                          await navigator.clipboard
                            .writeText(caseId)
                            .catch(() => {
                              return toast.error('Failed to copy to clipboard');
                            });
                          toast.success('Successfully copied case ID');
                          setIsCopying(true);
                        }}
                      >
                        {isCopying ? (
                          <ClipboardCheckIcon className="h-6 w-6 text-green-600" />
                        ) : (
                          <ClipboardIcon className="h-6 w-6 text-opacity-70 text-gray-900" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-800 text-white font-bold py-2 px-4 w-full rounded focus:outline-none focus:shadow-outline"
                      type="button"
                      onClick={() => close()}
                    >
                      Got it, thanks!
                    </button>
                  </div>
                </>
              )}
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CaseIDDialog;
