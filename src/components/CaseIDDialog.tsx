import { Dialog, Transition } from '@headlessui/react';
import { ClipboardCheckIcon, ClipboardIcon } from '@heroicons/react/outline';
import { Fragment, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { SpinnerCircular } from 'spinners-react';

import { ICaseIDDialogProps } from '../typings';
import Button from './Button';

const CaseIDDialog: React.FC<ICaseIDDialogProps> = ({
  isSubmitting,
  caseId,
  setCaseId,
  isOpen,
  setIsOpen
}: ICaseIDDialogProps) => {
  const titleRef = useRef(null);
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
        initialFocus={titleRef}
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
            <div className="my-8 inline-block w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-2xl transition-all">
              <Dialog.Title
                as="h3"
                className="text-center text-lg font-medium leading-6 text-gray-900"
              >
                <p ref={titleRef}>Case ID</p>
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
                    <div className="mx-12 mt-4 inline-flex flex-row items-center justify-center rounded-md bg-gray-200 p-2 px-3">
                      <p className="text-md mr-2 font-medium">{caseId}</p>
                      <button
                        className="rounded-md border-2 border-gray-900 border-opacity-70 p-[2px] shadow-md"
                        onClick={async () => {
                          await navigator.clipboard
                            .writeText(caseId)
                            .catch(() =>
                              toast.error('Failed to copy to clipboard')
                            );
                          toast.success('Successfully copied case ID');
                          setIsCopying(true);
                        }}
                      >
                        {isCopying ? (
                          <ClipboardCheckIcon className="h-6 w-6 text-green-600" />
                        ) : (
                          <ClipboardIcon className="h-6 w-6 text-gray-900 text-opacity-70" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button type="button" onClick={() => close()}>
                      Got it, thanks!
                    </Button>
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
