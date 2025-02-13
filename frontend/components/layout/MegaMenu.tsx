'use client'
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'

interface MegaMenuProps {
  category: string
}

const topLinks = ['Discover', 'Brands', 'Categories', 'Designers', 'Rankings']
const bottomLinks = ['Login', 'Liked Items', 'Saved Items', 'Submissions', 'About']

const MegaMenu = ({ category }: MegaMenuProps) => {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="text-sm tracking-[0.25em] hover:text-gray-500 transition-colors">
        {category}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition duration-100 ease-out"
        enterFrom="transform translate-x-[-100%]"
        enterTo="transform translate-x-0"
        leave="transition duration-75 ease-out"
        leaveFrom="transform translate-x-0"
        leaveTo="transform translate-x-[-100%]"
      >
        <Menu.Items className="fixed left-0 top-[140px] h-[calc(100vh-156px)] w-[400px] bg-white z-[48]">
          {/* White overlay to hide the border lines */}
          <div className="absolute -top-[1px] left-0 right-0 h-[2px] bg-white z-[1004]" />
          
          <div className="relative h-full border-r border-black">
            {/* Content wrapper */}
            <div className="h-full flex flex-col">
              {/* Top Links */}
              <div className="flex-1 py-12">
                {topLinks.map((link) => (
                  <Menu.Item key={link}>
                    {({ active }) => (
                      <a
                        href="#"
                        className="block px-12 py-4 text-sm tracking-[0.25em] hover:text-gray-500 transition-colors"
                      >
                        {link}
                      </a>
                    )}
                  </Menu.Item>
                ))}
              </div>

              {/* Bottom Links */}
              <div className="py-8 mb-24">
                {bottomLinks.map((link) => (
                  <Menu.Item key={link}>
                    {({ active }) => (
                      <a
                        href="#"
                        className="block px-12 py-2 text-sm tracking-[0.25em] hover:text-gray-500 transition-colors"
                      >
                        {link}
                      </a>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </div>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

export default MegaMenu 