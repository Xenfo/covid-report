import FingerprintJS from '@fingerprintjs/fingerprintjs-pro';
import { Dialog, Disclosure, Transition } from '@headlessui/react';
import axios from 'axios';
import { Field, Form, Formik } from 'formik';
import { DateTime } from 'luxon';
import type { NextPage } from 'next';
import Head from 'next/head';
import { Fragment, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { SpinnerCircular } from 'spinners-react';
import * as Yup from 'yup';

const CaseSchema = Yup.object().shape({
  caseIdOrRoomNumber: Yup.string()
    .required('Case ID or classroom number is required')
    .min(3, 'Must be a valid case ID or classroom number')
    .max(25, 'Must be a valid case ID or classroom number')
    .matches(
      /^(#[a-z0-9]{24})|([0-9]{3})$/,
      'Must be a valid case ID or classroom number'
    )
});

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
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-opacity-70 text-gray-900"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
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

interface StatsDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface Stats {
  cases: { class: string; cases: { amount: number; when: string }[] }[];
}

const StatsDialog: React.FC<StatsDialogProps> = ({
  isOpen,
  setIsOpen
}: StatsDialogProps) => {
  const [totalCases, setTotalCases] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ cases: [] });

  useEffect(() => {
    setIsLoading(true);

    const populateStats = async () => {
      const cases = await axios
        .get<{
          cases: {
            date: string;
            classroomNumber: string;
          }[];
        }>('/api/cases')
        .catch(() => {
          setIsOpen(false);
          toast.error('Failed to fetch case');
          return null;
        });

      if (!cases) return;

      const stats: Stats = { cases: [] };
      for (const { date, classroomNumber } of cases.data.cases) {
        const luxonDate = DateTime.fromJSDate(new Date(date));
        const when = DateTime.now()
          .diff(luxonDate, ['months', 'days', 'hours', 'minutes', 'seconds'])
          .toObject();

        const updatedStats = (term: string) => {
          const classroomIndex = stats.cases.findIndex(
            (c) => c.class === classroomNumber
          );

          if (classroomIndex >= 0) {
            const classroom = stats.cases[classroomIndex];
            const dateIndex = classroom.cases.findIndex((c) => c.when === term);
            if (dateIndex >= 0) {
              classroom.cases[dateIndex] = {
                ...classroom.cases[dateIndex],
                amount: classroom.cases[dateIndex].amount + 1
              };
            } else {
              classroom.cases.push({
                amount: 1,
                when: term
              });
            }
          } else {
            stats.cases.push({
              class: classroomNumber,
              cases: [{ amount: 1, when: term }]
            });
          }
        };

        if (when.days === 0) {
          const term = 'Less than 1 day ago';
          updatedStats(term);
        } else if (when.days === 1) {
          const term = '1 day ago';
          updatedStats(term);
        } else if (when.days! > 1 && when.days! <= 10) {
          const term = `${when.days!} days ago`;
          updatedStats(term);
        }
      }

      stats.cases.sort((a, b) => Number(a.class) - Number(b.class));

      setTotalCases(
        stats.cases
          .map((c) => c.cases.map((d) => d.amount).reduce((a, b) => a + b, 0))
          .reduce((a, b) => a + b, 0)
      );

      setStats(stats);
      setIsLoading(false);
    };

    if (isOpen) void populateStats();
  }, [isOpen, setIsOpen]);

  return (
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
                Stats - {totalCases} total {totalCases === 1 ? 'case' : 'cases'}
              </Dialog.Title>

              {isLoading ? (
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
                  <div className="w-full mt-4 bg-white max-h-52 overflow-y-scroll scrollbar scrollbar-thin scrollbar-track-gray-300 scrollbar-thumb-gray-700">
                    {stats.cases.map((c, i) => (
                      <Disclosure
                        key={i}
                        as="div"
                        className={`mr-2 md:mr-1 ${i > 0 ? 'mt-2' : ''}`}
                      >
                        {({ open }) => (
                          <>
                            <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left text-white bg-gray-900 rounded-lg hover:bg-gray-800">
                              <span>{c.class}</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`${
                                  open ? 'transform rotate-180' : ''
                                } w-5 h-5 text-white`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 15l7-7 7 7"
                                />
                              </svg>
                            </Disclosure.Button>
                            <Transition
                              as={Fragment}
                              enter="transition duration-100 ease-out"
                              enterFrom="transform scale-95 opacity-0"
                              enterTo="transform scale-100 opacity-100"
                              leave="transition duration-75 ease-out"
                              leaveFrom="transform scale-100 opacity-100"
                              leaveTo="transform scale-95 opacity-0"
                            >
                              <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-900">
                                <table className="table-fixed w-full">
                                  <thead>
                                    <tr>
                                      <th>Cases</th>
                                      <th>When</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {c.cases.map((d, j) => (
                                      <tr key={j}>
                                        <td>{d.amount}</td>
                                        <td>{d.when}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </Disclosure.Panel>
                            </Transition>
                          </>
                        )}
                      </Disclosure>
                    ))}
                  </div>

                  <div className="mt-4">
                    <button
                      className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-2 px-4 w-full rounded focus:outline-none focus:shadow-outline"
                      type="button"
                      onClick={() => setIsOpen(false)}
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

const Home: NextPage = () => {
  const [caseId, setCaseId] = useState('');
  const [visitorId, setVisitorId] = useState('');
  const [isOpenCase, setIsOpenCase] = useState(false);
  const [isOpenStats, setIsOpenStats] = useState(false);

  useEffect(() => {
    void FingerprintJS.load({
      token: process.env.NEXT_PUBLIC_FINGERPRINT_KEY!,
      endpoint: 'https://fp.xenfo.dev'
    })
      .then((fp) => fp.get())
      .then((result) => {
        setVisitorId(result.visitorId);
      });
  }, []);

  return (
    <div>
      <Head>
        <title>Covid Report</title>
        <meta
          name="description"
          content="Report Covid cases in the EMSB school system"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="flex justify-center items-center h-screen">
          <Formik
            validateOnChange
            initialValues={{ caseIdOrRoomNumber: '' }}
            validationSchema={CaseSchema}
            onSubmit={async ({ caseIdOrRoomNumber }) => {
              setIsOpenCase(true);

              const pdcCase = await axios
                .post<{ caseId: string; message: string }>(
                  '/api/cases',
                  {
                    visitorId,
                    caseIdOrRoomNumber
                  },
                  { validateStatus: (status) => status >= 200 && status < 500 }
                )
                .catch(() => {
                  setIsOpenCase(false);
                  toast.error('Failed to create case');
                  return null;
                });

              if (!pdcCase) return;

              if (pdcCase.status !== 200) {
                setIsOpenCase(false);
                return toast.error(pdcCase.data.message);
              }

              return setCaseId(pdcCase.data.caseId);
            }}
          >
            {({ errors, touched, isSubmitting }) => (
              <>
                <Form className="pt-6 pb-8 mb-4 w-4/5 md:w-2/5">
                  <p className="text-gray-900 text-lg font-bold">
                    Covid Report
                  </p>
                  <p className="mb-2 text-md text-gray-700">
                    If your child tested positive for Covid-19, please report it
                    in the field below. Reporting is anonymous and voluntary.
                    Please only submit reports for your child. If you already
                    have a case ID and your child tests positive after 5 days,
                    resubmit the case ID.
                  </p>
                  <Field
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Case ID or Classroom Number"
                    name="caseIdOrRoomNumber"
                    id="caseIdOrRoomNumber"
                    type="text"
                  />
                  {errors.caseIdOrRoomNumber && touched.caseIdOrRoomNumber ? (
                    <p className="text-red-600 -mb-1 md:mb-2">
                      {errors.caseIdOrRoomNumber}
                    </p>
                  ) : null}
                  <div className="flex flex-col w-full items-center mt-3 space-y-1">
                    <button
                      className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-800 text-white font-bold py-2 px-4 w-full rounded focus:outline-none focus:shadow-outline"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex flex-row justify-center">
                          <div className="inline-flex items-center mr-1">
                            <SpinnerCircular
                              className="inline-block"
                              size={15}
                              thickness={180}
                              color="#2563EB"
                              secondaryColor="#fff"
                            />
                          </div>
                          <span>Submitting</span>
                        </div>
                      ) : (
                        'Submit'
                      )}
                    </button>
                    <button
                      className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-2 px-4 w-full rounded focus:outline-none focus:shadow-outline"
                      type="button"
                      onClick={() => setIsOpenStats(true)}
                    >
                      Stats
                    </button>
                  </div>
                  <div className="text-center">
                    <p className="mt-1 md:mt-2 text-gray-700">
                      &copy; Made by{' '}
                      <a
                        href="https://github.com/Xenfo"
                        className="text-blue-600 underline underline-offset-4"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Samuel Corsi-House
                      </a>
                    </p>
                  </div>
                </Form>

                <CaseIDDialog
                  isSubmitting={isSubmitting}
                  caseId={caseId}
                  setCaseId={setCaseId}
                  isOpen={isOpenCase}
                  setIsOpen={setIsOpenCase}
                />
                <StatsDialog isOpen={isOpenStats} setIsOpen={setIsOpenStats} />
              </>
            )}
          </Formik>
        </div>
      </main>
    </div>
  );
};

export default Home;
