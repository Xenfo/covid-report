import { Dialog, Disclosure, Transition } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/outline';
import axios from 'axios';
import { DateTime } from 'luxon';
import { Fragment, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { SpinnerCircular } from 'spinners-react';

interface Stats {
  cases: { class: string; cases: { amount: number; when: string }[] }[];
}

interface StatsDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const StatsDialog: React.FC<StatsDialogProps> = ({
  isOpen,
  setIsOpen
}: StatsDialogProps) => {
  const [totalCases, setTotalCases] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ cases: [] });

  useEffect(() => {
    const populateStats = async () => {
      setIsLoading(true);

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
                              <ChevronUpIcon
                                className={`${
                                  open ? 'transform rotate-180' : ''
                                } w-5 h-5 text-white`}
                              />
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

export default StatsDialog;
