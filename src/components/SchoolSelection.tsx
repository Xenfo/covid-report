import { Listbox, Transition } from '@headlessui/react';
import {
  CheckIcon,
  SearchIcon,
  SelectorIcon,
  StarIcon as StarIconOutline
} from '@heroicons/react/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/solid';
import { useAtom } from 'jotai';
import { Fragment, useEffect, useMemo, useState } from 'react';

import { schools as schoolData, sortSchools } from '../lib/schools';
import { starredSchoolsAtom } from '../stores';
import { ISchoolSelectionProps } from '../typings';

const SchoolSelection: React.FC<ISchoolSelectionProps> = ({
  selectedSchool,
  setSelectedSchool
}: ISchoolSelectionProps) => {
  const [query, setQuery] = useState('');
  const [isOpen, _setIsOpen] = useState(false);
  const [starredSchools, setStarredSchools] = useAtom(starredSchoolsAtom);
  const [schools, setSchools] = useState(sortSchools(schoolData, []));
  const filteredSchools = useMemo(
    () =>
      schools.filter((s) =>
        s.name.toLowerCase().startsWith(query.toLowerCase())
      ),
    [query, schools]
  );

  useEffect(() => setQuery(''), [isOpen]);

  useEffect(() => {
    const sorted = sortSchools(
      schoolData,
      (starredSchools as string[] | undefined) ?? []
    );
    setSelectedSchool(sorted[0]);
    setSchools(sorted);
  }, [starredSchools, setSelectedSchool]);

  return (
    <Listbox value={selectedSchool} onChange={setSelectedSchool}>
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
            <div className="relative mx-2 mt-1 mb-2">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon
                  className="h-5 w-5 text-gray-700"
                  aria-hidden="true"
                />
              </span>
              <input
                className="focus:shadow-outline w-full appearance-none rounded border py-2 px-3 pl-10 leading-tight text-gray-700 shadow focus:outline-none"
                placeholder="Search..."
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            {filteredSchools.map((school, i) => (
              <Listbox.Option
                key={i}
                className={({ active }) =>
                  `${
                    active ? 'bg-blue-100 text-blue-900' : 'text-gray-700'
                  } relative cursor-default select-none py-2 pl-10 pr-4`
                }
                value={school}
              >
                {({ selected }) => (
                  <>
                    <div className="flex flex-row">
                      <div className="max-w-[85%]">
                        <span
                          className={`${
                            selected ? 'font-medium' : 'font-normal'
                          } block truncate`}
                        >
                          {school.name}
                        </span>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                            <CheckIcon className="h-6 w-6" aria-hidden="true" />
                          </span>
                        ) : null}
                      </div>
                      <span className="flex w-full items-center justify-end text-yellow-400">
                        {starredSchools.includes(school.alias) ? (
                          <StarIconSolid
                            className="h-6 w-6"
                            aria-hidden="true"
                            onClick={() =>
                              setStarredSchools(() =>
                                starredSchools.filter((s) => s !== school.alias)
                              )
                            }
                          />
                        ) : (
                          <StarIconOutline
                            className="h-6 w-6"
                            aria-hidden="true"
                            onClick={() =>
                              setStarredSchools([
                                ...starredSchools,
                                school.alias
                              ])
                            }
                          />
                        )}
                      </span>
                    </div>
                  </>
                )}
              </Listbox.Option>
            ))}
            {filteredSchools.length === 0 && (
              <Listbox.Option
                className="relative cursor-default select-none py-2 pl-10 pr-4 text-gray-700"
                value={null}
                disabled
              >
                <div className="flex flex-row">
                  <span className="block truncate font-normal">
                    No schools found
                  </span>
                </div>
              </Listbox.Option>
            )}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};

export default SchoolSelection;
