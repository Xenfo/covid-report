import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

import { IReadMoreDialogProps } from '../typings';
import Button from './Button';

const ReadMoreDialog: React.FC<IReadMoreDialogProps> = ({
  isOpen,
  setIsOpen
}: IReadMoreDialogProps) => (
  <Transition appear show={isOpen} as={Fragment}>
    <Dialog
      as="div"
      className="fixed inset-0 z-10 overflow-y-auto"
      onClose={() => setIsOpen(false)}
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

        <span className="inline-block h-screen align-middle" aria-hidden="true">
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
              Covid-19 Tracker for Schools
            </Dialog.Title>

            <div className="flex max-h-80 justify-center overflow-y-scroll scrollbar scrollbar-thin scrollbar-track-gray-300 scrollbar-thumb-gray-700">
              <div className="text-md mt-4 mr-2 text-gray-700 md:mr-1">
                <p>
                  The Quebec government is currently not allowing school
                  administrators to notify parents and guardians of Covid-19
                  cases at school. This website is a tool for EMSB parents to
                  self-report whether their child tested positive for Covid-19
                  and to allow parents to track the number of cases at their
                  child&apos;s school.
                </p>
                <p className="mt-2">
                  If your child tested positive for Covid-19, please report it
                  in the field below.{' '}
                  <b>Reporting is anonymous and voluntary.</b> Please only
                  submit reports for your own child. Cases are assumed to be
                  resolved after 5 days. However, if you already have a case ID
                  and your child tests positive again after 5 days, report the
                  case using the case ID.
                </p>
                <p className="mt-2">
                  We are counting on your honesty in submitting cases, because
                  we have no means to validate whether a case is real. The tool
                  imposes a limit to the number of cases than can be entered
                  over a 10-day period.
                </p>
                <p className="mt-2">
                  If you wish to have your school added to the tracker or if you
                  find any bugs, please send an email to:{' '}
                  <a
                    href="mailto:covid-report@xenfo.dev"
                    className="text-blue-600 underline underline-offset-4"
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={-1}
                  >
                    covid-report@xenfo.dev
                  </a>
                  .
                </p>
                <p className="mt-2">
                  <b>Disclaimer:</b> This tool is not affiliated with, nor
                  endorsed by, the English Montreal School Board. This tool was
                  developed for parents, at the request of parents.
                </p>
              </div>
            </div>

            <div className="mt-4">
              <Button type="button" onClick={() => setIsOpen(false)}>
                Got it, thanks!
              </Button>
            </div>
          </div>
        </Transition.Child>
      </div>
    </Dialog>
  </Transition>
);

export default ReadMoreDialog;
