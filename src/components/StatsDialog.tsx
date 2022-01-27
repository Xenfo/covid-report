import { Dialog, Disclosure, Listbox, Transition } from '@headlessui/react';
import {
  CheckIcon,
  ChevronUpIcon,
  SelectorIcon
} from '@heroicons/react/outline';
import axios from 'axios';
import { DateTime } from 'luxon';
import { Fragment, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { SpinnerCircular } from 'spinners-react';

import { ICase, ISchool, IStats, IStatsDialogProps } from '../typings';

const StatsDialog: React.FC<IStatsDialogProps> = ({
  isOpen,
  setIsOpen
}: IStatsDialogProps) => {
  const [cases, setCases] = useState<ICase[]>([]);
  const [totalCases, setTotalCases] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [schools, setSchools] = useState<ISchool[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<ISchool>({
    name: 'Select a school',
    alias: '',
    placeholder: '',
    classroomRegex: '',
    isByGrade: false,
    min: 0
  });

  const stats = useMemo(() => {
    const stats: IStats = { isByGrade: selectedSchool.isByGrade, cases: [] };
    for (const { date, classroomNumber } of cases.filter(
      (c) => c.school === selectedSchool.alias
    )) {
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

    return stats;
  }, [cases, selectedSchool]);

  useEffect(() => {
    const populateStats = async () => {
      setIsLoading(true);

      const cases = await axios
        .get<{ cases: ICase[] }>('/api/cases')
        .catch(() => {
          setIsOpen(false);
          toast.error('Failed to fetch case');
          return null;
        });
      if (!cases) return;
      setCases(cases.data.cases);

      const schools = await axios
        .get<ISchool[]>('/data/schools.json')
        .then((res) => res.data);

      setSchools(schools);
      setSelectedSchool(schools[0]);

      setIsLoading(false);
    };

    if (isOpen) {
      setTotalCases(0);
      void populateStats();
    }
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
            <div className="my-8 inline-block w-full max-w-md transform rounded-2xl bg-white p-6 text-left align-middle shadow-2xl transition-all">
              <Dialog.Title
                as="h3"
                className="text-center text-lg font-medium leading-6 text-gray-900"
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
                  <div className="mt-4 w-full bg-white">
                    <Listbox
                      value={selectedSchool}
                      onChange={setSelectedSchool}
                    >
                      <div className="relative mt-1">
                        <Listbox.Button className="focus:shadow-outline relative w-full cursor-default appearance-none rounded border bg-white py-2 pl-3 pr-10 text-left shadow focus:outline-none">
                          <span className="block truncate font-normal text-gray-700">
                            {selectedSchool.name}
                          </span>
                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <SelectorIcon
                              className="h-5 w-5 text-gray-400"
                              aria-hidden="true"
                            />
                          </span>
                        </Listbox.Button>
                        <Transition
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 scrollbar scrollbar-thin scrollbar-track-gray-300 scrollbar-thumb-gray-700 focus:outline-none">
                            {schools.map((school, i) => (
                              <Listbox.Option
                                key={i}
                                className={({ active }) =>
                                  `${
                                    active
                                      ? 'bg-blue-100 text-blue-900'
                                      : 'text-gray-700'
                                  } relative cursor-default select-none py-2 pl-10 pr-4`
                                }
                                value={school}
                              >
                                {({ selected }) => (
                                  <>
                                    <span
                                      className={`${
                                        selected ? 'font-medium' : 'font-normal'
                                      } block truncate`}
                                    >
                                      {school.name}
                                    </span>
                                    {selected ? (
                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                        <CheckIcon
                                          className="h-6 w-6"
                                          aria-hidden="true"
                                        />
                                      </span>
                                    ) : null}
                                  </>
                                )}
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </Listbox>
                    <div
                      className={`${
                        stats.cases.length > 0 ? 'mt-4' : ''
                      } max-h-52 overflow-y-scroll scrollbar scrollbar-thin scrollbar-track-gray-300 scrollbar-thumb-gray-700`}
                    >
                      {stats.cases.map((c, i) => (
                        <Disclosure
                          key={i}
                          as="div"
                          className={`mr-2 md:mr-1 ${i > 0 ? 'mt-2' : ''}`}
                        >
                          {({ open }) => (
                            <>
                              <Disclosure.Button className="flex w-full justify-between rounded-lg bg-gray-900 px-4 py-2 text-left text-sm font-medium text-white hover:bg-gray-800">
                                <span>
                                  {stats.isByGrade && c.class.length === 1
                                    ? c.class === 'K'
                                      ? 'Kindergarten'
                                      : `Grade ${c.class}`
                                    : c.class}
                                </span>
                                <ChevronUpIcon
                                  className={`${
                                    open ? 'rotate-180 transform' : ''
                                  } h-5 w-5 text-white`}
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
                                  <table className="w-full table-fixed">
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
                  </div>

                  <div className="mt-4">
                    <button
                      className="focus:shadow-outline w-full rounded bg-gray-900 py-2 px-4 font-bold text-white hover:bg-gray-800 focus:outline-none"
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
